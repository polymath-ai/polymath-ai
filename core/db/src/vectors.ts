import hnswlib from "hnswlib-node";
import duckdb from "duckdb";
import makeDir from "make-dir";

import fs from "fs";

import { Bit } from "@polymath-ai/types";

// TODO: Do not hardcode this.
const DIMENSIONS = 1536;

export class PathMaker {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  async ensure() {
    await makeDir(this.path);
  }

  exists() {
    return fs.existsSync(this.path);
  }

  get databaseFile() {
    return `${this.path}/database.db`;
  }

  get vectorIndexFile() {
    return `${this.path}/vector.idx`;
  }
}

export class VectorStore {
  path: string;
  dimensions: number;
  hnsw?: hnswlib.HierarchicalNSW;
  duckdb?: duckdb.Database;

  constructor(path: string, dimensions: number) {
    this.path = path;
    this.dimensions = dimensions;
  }

  async createNew() {
    const pathMaker = new PathMaker(this.path);
    await pathMaker.ensure();
    // TODO: Delete existing store files.
    this.duckdb = new duckdb.Database(pathMaker.databaseFile);
    this.hnsw = new hnswlib.HierarchicalNSW("cosine", this.dimensions);
  }

  async loadExisting() {
    const pathMaker = new PathMaker(this.path);
    // TODO: Check for existence of store files.
    this.duckdb = new duckdb.Database(pathMaker.databaseFile);
    this.hnsw = new hnswlib.HierarchicalNSW("cosine", this.dimensions);
    await this.hnsw.readIndex(pathMaker.vectorIndexFile);
  }

  async close() {
    if (!this.duckdb) return;

    const duckdb = this.duckdb;
    await new Promise((resolve) => {
      duckdb.close(resolve);
    });
  }
}

export class VectorStoreReader {
  store?: VectorStore;

  async init(path: string) {
    if (path === ":memory:") throw new Error("Cannot use :memory: for path");
    if (this.store) {
      await this.store.close();
    }
    this.store = new VectorStore(path, DIMENSIONS);
    await this.store.loadExisting();
  }

  async search(query: number[], k: number): Promise<Bit[]> {
    if (!this.store) throw new Error("VectorStore not initialized");

    if (!this.store.hnsw) throw new Error("hnsw not initialized");

    const results = this.store.hnsw.searchKnn(query, k);

    if (!results) throw new Error("No results found");

    if (!this.store.duckdb) throw new Error("duckdb not initialized");

    const conn = this.store.duckdb.connect();

    return await new Promise((resolve, reject) => {
      conn.all(
        `SELECT * FROM library WHERE id IN (${results.neighbors
          .map(() => "?")
          .join(",")})`,
        ...results.neighbors,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

export class VectorStoreWriter {
  path: string;
  store?: VectorStore;

  constructor(path: string) {
    this.path = path;
  }

  async write(bits: Bit[]) {
    const store = new VectorStore(this.path, DIMENSIONS);
    await store.createNew();

    const numElements = bits.length;
    const hnsw = store.hnsw;
    const db = store.duckdb;
    if (!hnsw) throw new Error("hnsw not initialized");
    if (!db) throw new Error("duckdb not initialized");

    hnsw.initIndex(numElements);
    bits.forEach((bit, i) => {
      if (!bit.embedding) return;
      hnsw.addPoint(bit.embedding, i);
    });

    const conn = db.connect();

    await new Promise((resolve) => {
      conn.exec("DROP TABLE IF EXISTS library", resolve);
    });

    await new Promise((resolve) => {
      conn.exec(
        "CREATE TABLE library (id INTEGER, text VARCHAR, url VARCHAR, token_count INTEGER)",
        resolve
      );
    });

    const insertion = conn.prepare("INSERT INTO library VALUES (?, ?, ?, ?)");
    bits.forEach((bit, i) =>
      insertion.run(i, bit.text, bit.info?.url || "", bit.token_count)
    );
    await new Promise((resolve) => {
      insertion.finalize(resolve);
    });

    const pathMaker = new PathMaker(this.path);
    await hnsw.writeIndex(pathMaker.vectorIndexFile);
  }
}

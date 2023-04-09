import hnswlib from "hnswlib-node";
import duckdb from "duckdb";
import makeDir from "make-dir";

import fs from "fs";

import { Bit } from "@polymath-ai/types";

export interface IReader {
  search(query: number[], k: number): Promise<Bit[]>;
}

export interface IWriter {
  write(bits: Bit[]): Promise<void>;
}

export class PathMaker {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  async ensure() {
    await makeDir(this.path);
  }

  filesExist() {
    return (
      fs.existsSync(this.databaseFile) && fs.existsSync(this.vectorIndexFile)
    );
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

  async createReader(): Promise<IReader> {
    if (this.duckdb && this.hnsw) return new VectorStoreReader(this);

    const pathMaker = new PathMaker(this.path);
    if (!pathMaker.filesExist()) {
      throw new Error(`Store "${this.path}" does not exist`);
    }
    this.duckdb = new duckdb.Database(pathMaker.databaseFile);
    this.hnsw = new hnswlib.HierarchicalNSW("cosine", this.dimensions);
    await this.hnsw.readIndex(pathMaker.vectorIndexFile);
    return new VectorStoreReader(this);
  }

  async createWriter(): Promise<IWriter> {
    const pathMaker = new PathMaker(this.path);
    await pathMaker.ensure();
    // TODO: Delete existing store files.
    this.duckdb = new duckdb.Database(pathMaker.databaseFile);
    this.hnsw = new hnswlib.HierarchicalNSW("cosine", this.dimensions);
    return new VectorStoreWriter(this);
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
  hnsw: hnswlib.HierarchicalNSW;
  duckdb: duckdb.Database;

  constructor(store: VectorStore) {
    if (!store.hnsw) throw new Error("hnsw not initialized");
    if (!store.duckdb) throw new Error("duckdb not initialized");
    this.hnsw = store.hnsw;
    this.duckdb = store.duckdb;
  }

  async search(query: number[], k: number): Promise<Bit[]> {
    const results = this.hnsw.searchKnn(query, k);

    if (!results) throw new Error("No results found");

    const conn = this.duckdb.connect();

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
  hnsw: hnswlib.HierarchicalNSW;
  duckdb: duckdb.Database;
  vectorIndexFilename: string;

  constructor(store: VectorStore) {
    if (!store.hnsw) throw new Error("hnsw not initialized");
    if (!store.duckdb) throw new Error("duckdb not initialized");
    this.hnsw = store.hnsw;
    this.duckdb = store.duckdb;
    this.vectorIndexFilename = new PathMaker(store.path).vectorIndexFile;
  }

  async write(bits: Bit[]): Promise<void> {
    const numElements = bits.length;
    const hnsw = this.hnsw;
    const db = this.duckdb;

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

    await hnsw.writeIndex(this.vectorIndexFilename);
  }
}

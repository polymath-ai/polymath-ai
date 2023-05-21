import path from "path";

import express from "express";

const ASSETS_FOLDER = "assets";
const ASSETS_PATH = path.resolve(ASSETS_FOLDER);

const SCRIPTS_FOLDER = "scripts";
const SCIPTS_PATH = path.resolve("dist/src/web");

const AI_FOLDER = "openai";
const AI_PATH = path.resolve(
  "../../node_modules/@polymath-ai/ai/dist/src/openai"
);

const ZOD_FOLDER = "zod";
const ZOD_PATH = path.resolve("../../node_modules/zod/lib");

export class Web {
  private port: number;
  constructor(port = 3000) {
    this.port = port;
  }
  async serve(): Promise<void> {
    const app = express();
    app.use(`/${ASSETS_FOLDER}`, express.static(ASSETS_PATH));
    app.use(`/${SCRIPTS_FOLDER}`, express.static(SCIPTS_PATH));
    app.use(`/${AI_FOLDER}`, express.static(AI_PATH));
    app.use(`/${ZOD_FOLDER}`, express.static(ZOD_PATH));
    app.all("/", function (req, res) {
      res.sendFile("index.html", { root: ASSETS_PATH });
    });
    const server = app.listen(this.port);
    return new Promise((resolve) => {
      process.on("SIGINT", () => {
        server.close();
      });
      server.on("close", resolve);
    });
  }
}

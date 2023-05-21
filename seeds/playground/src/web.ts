import path from "path";

import express from "express";

const ASSETS_PATH = path.resolve("assets");

const dirs = {
  assets: ASSETS_PATH,
  scripts: path.resolve("dist/web"),
  openai: path.resolve("../../node_modules/@polymath-ai/ai/dist/src/openai"),
  zod: path.resolve("../../node_modules/zod/lib"),
  codemirror: path.resolve("../../node_modules/codemirror/dist"),
  "codemirror-markdown": path.resolve(
    "../../node_modules/@codemirror/lang-markdown/dist"
  ),
  "codemirror-state": path.resolve("../../node_modules/@codemirror/state/dist"),
  "codemirror-view": path.resolve("../../node_modules/@codemirror/view/dist"),
  "codemirror-language": path.resolve(
    "../../node_modules/@codemirror/language/dist"
  ),
};

export class Web {
  private port: number;
  constructor(port = 3000) {
    this.port = port;
  }
  async serve(): Promise<void> {
    const app = express();
    Object.entries(dirs).forEach(([name, dir]) => {
      app.use(`/${name}`, express.static(dir));
    });
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

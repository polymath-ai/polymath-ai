import express from "express";
import multer from "multer";

import { Action } from "../action.js";
import { ServeArgs } from "@polymath-ai/types";
import { PolymathFile, fromObject } from "@polymath-ai/host";

const PORT = 8008;

export class Serve extends Action {
  override async run(opts: ServeArgs): Promise<void> {
    const { log, error } = this.say;
    if (opts.type !== "file") {
      throw new Error("Only file serve type is supported at this time.");
    }
    const libraryFiles = this.clientOptions().libraryFiles;
    if (!libraryFiles || !libraryFiles.length) {
      throw new Error("No library files were provided.");
    }
    const fileHost = new PolymathFile(libraryFiles);
    return new Promise(() => {
      const app = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(multer().none());
      app.post("/", async (req, res) => {
        const { body } = req;
        if (!body) {
          res.status(400).send("No body provided.");
          return;
        }
        log("Query from client: ", req.ip);
        const options = fromObject(body);
        const response = await fileHost.queryPacked(options);

        res.status(200).json(response);
      });
      app.listen(PORT, () => {
        log(`Server listening on port ${PORT}`);
      });
    });
  }
}

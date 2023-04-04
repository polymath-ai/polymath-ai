import { Action } from "../action.js";
import { ServeArgs } from "@polymath-ai/types";

import express from "express";

const PORT = 3000;

export class Serve extends Action {
  override async run(opts: ServeArgs): Promise<void> {
    const { log } = this.say;
    return new Promise(() => {
      log("SERVE!", JSON.stringify(opts, null, 2));

      const app = express();

      app.post("/", (request, response) => {
        log("request", JSON.stringify(request, null, 2));
        response.send("Hello from Express!");
      });

      app.listen(PORT);
    });
  }
}

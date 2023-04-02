import { Action } from "../action.js";
import { ServeArgs } from "@polymath-ai/types";

export class Serve extends Action {
  override async run(opts: ServeArgs): Promise<void> {
    const { debug, error, log } = this.say;
    return new Promise((resolve) => {
      console.log("SERVE!");
      resolve();
    });
  }
}

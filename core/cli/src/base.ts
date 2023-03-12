import chalk from "chalk";

const error = (...args: any) => console.error(chalk.red("ERROR:", ...args));
const log = (msg: any, ...args: any) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));

// Base class with all the useful infrastructure.
export class Base {
  isDebug: boolean;
  say: any;

  constructor({ debug }: { debug: boolean }) {
    this.isDebug = debug;
    this.say = {
      debug: this.#debug.bind(this),
      error,
      log,
      chalk,
    };
  }

  #debug(...args: any) {
    if (this.isDebug) {
      console.log(chalk.blue("DEBUG:", ...args));
    }
  }
}

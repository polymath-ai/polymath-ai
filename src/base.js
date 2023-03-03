import chalk from "chalk";

const error = (...args) => console.error(chalk.red("ERROR:", ...args));
const log = (msg, ...args) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));

// Base class with all the useful infrastructure.
export class Base {
  constructor(isDebug) {
    this.isDebug = isDebug;
    this.say = {
      debug: this.#debug.bind(this),
      error,
      log,
    };
  }

  #debug(...args) {
    if (this.isDebug) {
      console.log(chalk.blue("DEBUG:", ...args));
    }
  }
}

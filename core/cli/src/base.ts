import chalk from "chalk";

const error = (...args: unknown[]) =>
  console.error(chalk.red("ERROR:", ...args));
const log = (msg: string, ...args: unknown[]) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));

export interface Say {
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  log: (msg: string, ...args: unknown[]) => void;
  chalk: typeof chalk;
}

// Base class with all the useful infrastructure.
export class Base {
  isDebug: boolean;
  say: Say;

  constructor({ debug }: { debug?: boolean }) {
    this.isDebug = debug || false;
    this.say = {
      debug: this.#debug.bind(this),
      error,
      log,
      chalk,
    };
  }

  #debug(...args: unknown[]) {
    if (this.isDebug) {
      console.log(chalk.blue("DEBUG:", ...args));
    }
  }
}

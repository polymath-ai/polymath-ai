import chalk from "chalk";

const error = (...args: any[]) => console.error(chalk.red("ERROR:", ...args));
const log = (msg: string, ...args: any[]) =>
  console.log(chalk.green(`\n${msg}`), chalk.bold(...args));

export interface Say {
  debug: (...args: any[]) => void;
  error: (...args: any[]) => void;
  log: (...args: any[]) => void;
  chalk: typeof chalk;
}

// Base class with all the useful infrastructure.
export class Base {
  isDebug: boolean;
  say: Say;

  constructor({ debug }: { [debug: string]: boolean }) {
    this.isDebug = debug;
    this.say = {
      debug: this.#debug.bind(this),
      error,
      log,
      chalk,
    };
  }

  #debug(...args: any[]) {
    if (this.isDebug) {
      console.log(chalk.blue("DEBUG:", ...args));
    }
  }
}

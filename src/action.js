import chalk from "chalk";

export class Action {
  isDebug;

  constructor({ debug }) {
    this.isDebug = debug;
  }

  debug(...args) {
    if (this.isDebug) {
      console.log(chalk.blue('DEBUG:', ...args));
    }
  }
}

export const actor = (cls, program) => {
  return (...args) => {
    const [options, command] = args.slice(-2);
    args = args.slice(0, -2);
    const ask = new cls(program.opts());
    ask.run({ args, options, command });
  }
}

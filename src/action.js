import { Base } from "./base.js";

export class Action extends Base {

  constructor({ debug }) {
    super(debug);
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

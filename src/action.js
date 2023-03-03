import { Base } from "./base.js";
import { Options } from "./options.js";

export class Action extends Base {
  #options

  constructor(options) {
    super(options.debug);
    this.#options = options;
  }

  options() {
    const opts = new Options(this.isDebug);
    const { debug } = this.say;

    const configOption = this.#options.config;  
    const rawConfig = opts.loadRawConfig(configOption);
    const clientOptions = {
      ...opts.normalizeClientOptions(this.#options, rawConfig),
      debug: this.isDebug,
    };
    debug("Client options", JSON.stringify(clientOptions));
    return clientOptions;
  }
}

export const actor = (cls, program) => {
  return (...args) => {
    const [options, command] = args.slice(-2);
    args = args.slice(0, -2);
    const ask = new cls(program.opts());
    ask.run({ args, options, command });
  };
};

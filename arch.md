## Class layout

There is a `Base` class in `src/base.js`, and it's a really good class to extend. It's meant to provide common infrastructure, such as reporting errors, and hopefully more useful stuff in the future.

For example, it has a pretty cool `say` member, which can be used to say stuff back to the user. For example:

```js
this.say.error("Something went wrong");
this.say.debug("The value of foo is", foo);
```

You can also do this nifty thing to create locals from `say`:

```js
const { debug, error } = this.say;
...
debug("The value of foo is", foo);
```

Extending `Base`, there's an `Action` class, which represents an `action` for a given `command` of the tool. This class is also meant to be extended. It provides more useful common infrastructure that would be common to all actions.

## Where to add stuff

- To add a new action, make a new class that extends `Action`.
- If the code seems like it could be shared across multiple actions, put it into the `Action` class.
- If the code seems like it could be shared across all classes, put it into the `Base` class.

## Making a new action

If you are building a new action, extend the `Action` class. To hook it into your command, use the `actor` helper function from `src/action.js`. For example:

```js
import { actor } from "./action.js";
import { Validate } from "./actions/validate.js";

...

program
  .command("validate")
  .description("Validate a Polymath endpoint")
  .argument("[url]", "The URL of the endpoint to validate")
  .action(actor(Validate, program));
```

The `Validate` class may look as follows:

```js
import { Action } from "../action.js";

export class Validate extends Action {
  // Make sure to always pass the argument to the super constructor
  constructor(options) {
    super(options);
  }

  // This is the main entry point for your action.
  // The arguments mirror that of the action handler in Commander.
  async run({ args, options, command }) {
    // implement your action code here
  }
}
```

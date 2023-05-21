import { Validator } from "jsonschema";
import type { Schema } from "jsonschema";

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

// TODO: This is not a great converter. But it'll do for now.
export class SchemishConverter {
  schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  convert() {
    const walker = (schema: Schema): JSONValue => {
      if (schema.type === "string") {
        return schema.description || "";
      }
      if (schema.type === "object") {
        const result: JSONValue = {};
        const properties = schema.properties as Record<string, Schema>;
        for (const [name, property] of Object.entries(properties)) {
          result[name] = walker(property);
        }
        return result;
      }
      if (schema.type === "array") {
        const items = (schema.items as Schema) || {};
        return [walker(items)];
      }
      console.log(schema);
      throw new Error(
        "I am just a simple Schemish converter. I don't understand your fancy types and formats. Yet."
      );
    };

    const data = walker(this.schema);
    return JSON.stringify(data, null, 2);
  }

  validate(value: JSONValue) {
    const validator = new Validator();
    const validationResult = validator.validate(value, this.schema);
    return validationResult.valid;
  }
}

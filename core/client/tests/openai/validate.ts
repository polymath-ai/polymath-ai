import test from "ava";
import {
  ValidationError,
  validateCompletionRequest,
} from "../../src/openai/validate.js";

test("Promptless CompletionRequest throws a friendly error", async (t) => {
  const error: ValidationError = t.throws(() => {
    validateCompletionRequest({});
  }) as ValidationError;
  t.deepEqual(error?.message, "Validation error");
  t.is(error?.issues.length, 1);
  t.deepEqual(error?.issues, [
    {
      message: '"model" Required',
      description:
        "ID of the model to use. You can use the [List models](docsapi-reference/models/list) API to see all of your available models, or see our [Model overview](/docs/models/overview) for descriptions of them.",
    },
  ]);
  t.deepEqual(
    error.toString(),
    `Validation error:\n  - "model" Required\n      ID of the model to use. You can use the [List models](docsapi-reference/models/list) API to see all of your available models, or see our [Model overview](/docs/models/overview) for descriptions of them.\n`
  );
});

import test from "ava";
import {
  ValidationError,
  validateCompletionRequest,
} from "../../src/openai/validate.js";

test("Model-less CompletionRequest throws a friendly error", async (t) => {
  const error: ValidationError = t.throws(() => {
    validateCompletionRequest({});
  }) as ValidationError;
  t.deepEqual(error?.message, "Validation error in CompletionRequest");
  t.is(error?.issues.length, 1);
  t.deepEqual(error?.issues[0].message, '"model" Required');
  t.truthy(error?.issues[0].description);
  t.true(`${error}`.includes("model"));
});

test("Invalid types in CompletionRequest throw a friendly error", async (t) => {
  const error: ValidationError = t.throws(() => {
    validateCompletionRequest({ model: 123 });
  }) as ValidationError;
  t.deepEqual(error?.message, "Validation error in CompletionRequest");
  t.is(error?.issues.length, 1);
  t.deepEqual(
    error?.issues[0].message,
    '"model" Expected string, received number'
  );
  t.truthy(error?.issues[0].description);
  t.true(`${error}`.includes("model"));
});
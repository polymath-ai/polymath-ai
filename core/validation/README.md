Three kinds of validation:

1. Validation of a Polymath request. This is useful to verify that that the data we're sending to the endpoint is valid.
2. Validation of a Polymath response. This is useful to verify that the data the endpoint returns is valid.
3. Validation of endpoint behavior. This is useful to verify that the endpoint behaves as expected in response to various requests.

The first two we can do with JSON Schema.

The third one is something that can only be accomplished by repeated querying of the endpoint with varying parameters.

The `harness` module is designed to make the behavior validation easy. It mimics a typical test harness.

The `validator` module is where all the behavior validation happens.

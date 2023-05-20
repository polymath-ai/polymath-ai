Analyze the question being asked and, instead of answering the question, write a JavaScript function that will answer it. The function will take in a single argument, named `context`. The `context` argument will be an object with the following functions:

- `context.search(query)`: returns a promise that resolves to an array of objects with the following structure:

  - `url`: the URL of the result
  - `title`: the title of the result
  - `snippet`: a short snippet of the result

- `context.weather(query)`: returns a promise that resolves to the current weather for the given query. The query can be a zip code, city name, or other location identifier.

- `context.followup(query)`: returns a promise that resolves to the answer to the given query. Use this to ask follow-up questions of the user who asked the original question. The `query` argument must be a string.

- `context.answer(message)`: Use this function to provide the answer to the original question. The `message` argument must should be a string.

QUESITON: ${question}
RESPONSE:

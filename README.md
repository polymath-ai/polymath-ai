# Polymath Remix Client & Endpoint

This is a Polymath Client and Endpoint.

it vends a couple things:

- /: The main client to ask questions of
- /local: Just ask the polymath for results with context locally

- /endpoint/ask: return Polymath results as json
- /endpoint/complete: return Polymath results AND answers

## Configuration

Create a `host.SECRET.json` file in the `/app/config` directory that
contains the configuration for your endpoint.

There are other examples in the [config](app/config) directory that
shows a variety of setups.

Your file should have some of:

```js
{
  "endpoint": "https://yourendpoint.polymath.chat",

  "// for when we support private access like the python version":"",
  "default_private_access_tag": "unpublished",

  "default_api_key": "<Your OpenAI API Key",

  "// These are the settings for the @polymath-ai/polymath-js-client"
  "// So instead of libraryFiles you can and/or pinecone settings, and servers"
  "client_options": {
    "libraryFiles": ["./libraries/knowledge-string.json"],
    "omit": "embedding",
    "debug": true
  },

  "completions_options": {
    "model": "text-davinci-003",
    "prompt_template": "Answer the question as truthfully as possible using the provided context, and if don't have the answer, say \"I don't know\" and suggest looking for this information elsewhere.\n\nContext:\n{context} \n\nQuestion:\n{query}\n\nAnswer:",
    "max_tokens": 256,
    "temperature": 0,
    "top_p": 1,
    "n": 1,
    "stream": false,
    "logprobs": null,
    "debug": true
  },

  "// These server options will show up as check boxes for someone to select/de-select",
  "// If you want to always search these, you would just put the urls in client_options => servers array",
  "server_options": [
    {
      "url": "https://polymath.almaer.com/",
      "name": "Dion's Polymath"
    },
    {
      "url": "https://polymath.glazkov.com/",
      "name": "Dimitri's Polymath"
    },
    {
      "url": "https://polymath.komoroske.com/",
      "name": "Alex's Polymath"
    }
    ],

    "info": {
      "headername": "Generators",
      "placeholder": "What do you want to learn from the Bits?",
      "fun_queries": [
        "What does gardening have to do with strategy?",
        "What do you think of the Web platform?",
        "How do Dion and Alex think differently about strategy?"
      ],
      "source_prefixes": {
        "https://komoroske.com/": "Alex: ",
        "https://thecompendium.cards/": "Alex: ",
        "https://medium.com/@komorama/": "Alex: ",
        "https://glazgov.com/": "Dimitri: ",
        "https://whatdimitrilearned.substack.com/": "Dimitri: ",
        "https://blog.almaer.com/": "Dion: ",
        "https://medium.com/@dalmaer": "Dion: ",
        "https://twitter.com/dalmaer/": "Dion: "
      }
  }}
```

## Deployment

### fly.io deployment

- Setup an account on [fly.io](fly.io)
- Download and install the command line
- fly launch --now # and follow the prompts

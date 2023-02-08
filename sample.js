import { Polymath } from "./main.js";

let p = new Polymath({
    apiKey: process.env.OPENAI_API_KEY,
    libraryFiles: ['./libraries/knowledge-string.json']
});

// console.log("OpenAI API Key:", p.apiKey);

// -- Ask our Polymath to do his job and return his bits and pieces
// let r = await p.results("How long is a piece of string?");
// console.log("Context: ", r.context);
// console.log("Results: ", r);

// -- Ask our Polymath to do us a favor and get hits bits and pieces and use them to query OpenAI
let cr = await p.completion("How long is a piece of string?");
console.log("Results: ", cr);

// -- Oh, you can also just get an embedding from a string
// let embedding = await p.generateEmbedding("DION");
// console.log("Embedding: ", embedding);

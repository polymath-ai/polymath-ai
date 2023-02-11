import test from 'ava';
import { Polymath } from "../main.js";

test('Polymath requires an OpenAI API Key', t => {
	try {
		let p = new Polymath({
			apiKey: "sk-fake-api-key",
			libraryFiles: ['./libraries/knowledge-string.json']
		});

		t.pass();
	} catch (e) {
		t.fail();
	}
});

test('Polymath errors without an OpenAI API Key', t => {
	try {
		new Polymath();
		t.fail();
	} catch (e) {
		t.pass();
	}
});

test('Polymath gets results', async t => {
	try {
		let p = new Polymath({
			apiKey: process.env.OPENAI_API_KEY,
			libraryFiles: ['./libraries/knowledge-string.json']
		});

		let r = await p.results("How long is a piece of string?");

		if (r.context()) {
			t.pass();
		}
	} catch (e) {
		t.fail();
	}
});
//
// console.log("OpenAI API Key:", p.apiKey);

// -- Ask our Polymath to do his job and return his bits and pieces
// let r = await p.results("How long is a piece of string?");
// console.log("Context: ", r.context());
// console.log("Results: ", r);

// -- Ask our Polymath to do us a favor and get hits bits and pieces and use them to query OpenAI
// let cr = await p.completion("How long is a piece of string?");
// console.log("Results: ", cr);

// -- Oh, you can also just get an embedding from a string
// let embedding = await p.generateEmbedding("DION");
// console.log("Embedding: ", embedding);

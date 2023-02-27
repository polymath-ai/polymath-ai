import functions from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';

import { Polymath } from '@polymath-ai/client';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json())

const openai_api_key = defineString('OPENAI_API_KEY');

app.post('/api', async (req, res) => {
  const query = req.body.query;
  const polymath = new Polymath({
    apiKey: openai_api_key.value(),
    servers: [ 'https://polymath.komoroske.com/ '],
  });
  const results = await polymath.completion(query);
  res.json(results);
});

const api = functions.runWith({ openai_api_key }).https.onRequest(app);

export { api }
import functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';

import { Polymath } from '@polymath-ai/client';

const app = express();

const openai_api_key = defineSecret('OPENAI_API_KEY');

app.use(cors({ origin: true }));

app.get('/api', async (req, res) => {
  const polymath = new Polymath({
    apiKey: openai_api_key.value(),
    servers: [ 'https://polymath.almaer.com/ '],
  });
  const results = await polymath.completion('What is an ajaxian?')
  res.json(results);
});

const api = functions.runWith({ openai_api_key }).https.onRequest(app);

export { api }
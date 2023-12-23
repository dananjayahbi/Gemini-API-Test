import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

dotenv.config();

const MODEL_NAME = 'gemini-pro';
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  });
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const parts = [{ text: prompt }];

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.4,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const response = result.response;
    res.status(200).send({
      bot: response.text(),
    });

  } catch (error) {
    console.error(error);
    res.status(500).send(error || 'Something went wrong');
  }
});

app.listen(5000, () => console.log('AI server started on http://localhost:5000'));

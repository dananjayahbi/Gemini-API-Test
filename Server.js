const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

//Setting up the server
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8060;

app.use(cors());
app.use(express.json());

//Setting up routes
// app.use('/auth', require('./routes/userRouter'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Setting up mongoose
const URL = process.env.MONGODB_URL;

mongoose.set("strictQuery", true);
mongoose.connect(URL, {
    useNewUrlParser: true,
});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

//Setting up Google Gemini API
const {
 GoogleGenerativeAI,
 HarmCategory,
 HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
  temperature: 0.4,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
   category: HarmCategory.HARM_CATEGORY_HARASSMENT,
   threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
   category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
   threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
   category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
   threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
   category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
   threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  const parts = [
   { text: prompt },
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  res.json({ text: response.text() });
});


//In the Postrman, use "http://localhost:5000/generate" route with post and use the following Json as the payload: 

// {
//     "prompt": "Do you like react JS?"
// }
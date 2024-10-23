// index.js

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Replace this with your OpenAI API key
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';

// List of allowed custom Bearer tokens
const ALLOWED_TOKENS = ['YOUR_CUSTOM_TOKEN_1', 'YOUR_CUSTOM_TOKEN_2', 'YOUR_CUSTOM_TOKEN_3'];

// Middleware to parse different types of requests, including binary
app.use(express.raw({ type: '*/*' }));

// Middleware to check for custom Bear token
app.use((req, res, next) => {
  const bearerToken = req.headers['authorization'];
  if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
    return res.status(403).send('Forbidden: Missing or invalid Bearer token');
  }
  const token = bearerToken.split(' ')[1];
  if (!ALLOWED_TOKENS.includes(token)) {
    return res.status(403).send('Forbidden: Token not allowed');
  }
  next();
});

// Home page endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Proxy endpoint that redirects all incoming requests to the OpenAI endpoint
app.all('*', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `https://api.openai.com${req.originalUrl}`,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...req.headers,
      },
      data: req.body
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Proxy running at http://localhost:${PORT}`);
});

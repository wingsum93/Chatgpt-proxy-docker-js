// index.js

const express = require('express');
const axios = require('axios');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// OpenAI API key from .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// List of allowed custom Bearer tokens from .env
const ALLOWED_TOKENS = process.env.ALLOWED_TOKENS ? process.env.ALLOWED_TOKENS.split(',') : [];

// Create an agent that disables SSL verification
console.log('create ssl agent');
const agent = new https.Agent({  
  rejectUnauthorized: false
});

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
  console.log('process status:', req.method, req.originalUrl);
  try {
    const response = await axios({
      method: req.method,
      url: `https://api.openai.com${req.originalUrl}`,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...req.headers,
      },
      data: req.body,
      httpsAgent: agent  // Attach the custom agent
    });
    res.status(response.status).send(response.data);
    console.log('process status already:', response.code);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Proxy running at http://localhost:${PORT}`);
  console.log('ALLOWED_TOKENS:', ALLOWED_TOKENS);
  console.log('OPENAI_API_KEY:', OPENAI_API_KEY);
});

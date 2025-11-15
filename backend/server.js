const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Airia configuration
const AIRIA_API_URL = 'https://api.airia.ai/v2/PipelineExecution/252ecfc2-689f-484b-877c-9a6211cda1ba';
const AIRIA_API_KEY = process.env.AIRIA_API_KEY || process.env.REACT_APP_API_TOKEN || 'ak-NjcxNTg4NDY3fDE3NjMyNDU2NjY4MDh8dGktYzJWeWRtbGpaVzV2ZHkxUGNHVnlJRkpsWjJsemRISmhkR2x2YmkxUWNtOW1aWE56YVc5dVlXdz18MXwyNzQyOTU0MTE1';

console.log('[Backend] Airia API Key:', AIRIA_API_KEY ? `${AIRIA_API_KEY.substring(0, 10)}...` : 'NOT SET');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// Proxy endpoint for Airia
app.post('/api/learn', async (req, res) => {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return res.status(400).json({ error: 'userInput is required' });
    }

    console.log(`[Proxy] Forwarding request to Airia: ${userInput}`);
    console.log(`[Proxy] Using API Key: ${AIRIA_API_KEY ? AIRIA_API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);

    // Make request to Airia
    const response = await axios.post(
      AIRIA_API_URL,
      {
        userInput: userInput,
        asyncOutput: false
      },
      {
        headers: {
          'X-API-KEY': AIRIA_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 420000 // 7 minute timeout
      }
    );

    console.log('[Proxy] Received response from Airia');
    console.log('[Proxy] Response Status:', response.status);

    // Parse the response - Airia returns result as a string
    let parsedData = response.data;
    
    // If result is a string, parse it
    if (response.data.result && typeof response.data.result === 'string') {
      console.log('[Proxy] Parsing result string from Airia...');
      parsedData = JSON.parse(response.data.result);
    }
    
    console.log('[Proxy] Parsed Data Type:', typeof parsedData);
    console.log('[Proxy] Parsed Data:', JSON.stringify(parsedData, null, 2));

    // Return the parsed data to frontend
    res.json({ data: parsedData });
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    console.error('[Proxy] Status:', error.response?.status);
    console.error('[Proxy] Response:', error.response?.data);

    if (error.response) {
      // Airia returned an error
      console.error('[Proxy] Airia API Error - Status:', error.response.status);
      console.error('[Proxy] Full Response:', JSON.stringify(error.response.data, null, 2));
      res.status(error.response.status).json({
        error: 'Airia API Error',
        status: error.response.status,
        message: error.response.data,
        details: error.response.data
      });
    } else if (error.request) {
      // Request made but no response
      console.error('[Proxy] No response from Airia');
      res.status(503).json({
        error: 'No response from Airia',
        message: error.message
      });
    } else {
      // Error in request setup
      console.error('[Proxy] Server error:', error.message);
      res.status(500).json({
        error: 'Server error',
        message: error.message
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Airia endpoint: ${AIRIA_API_URL}`);
  console.log(`🔑 API Key configured: ${AIRIA_API_KEY ? 'Yes' : 'No'}`);
});

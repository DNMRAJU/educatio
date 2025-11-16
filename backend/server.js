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
const AIRIA_API_URL = process.env.AIRIA_API_URL || 'https://api.airia.ai/v2/PipelineExecution/252ecfc2-689f-484b-877c-9a6211cda1ba';
const AIRIA_API_KEY = process.env.AIRIA_API_KEY || process.env.REACT_APP_API_TOKEN || 'ak-NjcxNTg4NDY3fDE3NjMyNDU2NjY4MDh8dGktYzJWeWRtbGpaVzV2ZHkxUGNHVnlJRkpsWjJsemRISmhkR2x2YmkxUWNtOW1aWE56YVc5dVlXdz18MXwyNzQyOTU0MTE1';
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '300000', 10); // 5 minutes default

console.log('[Backend] Configuration:');
console.log('  - Airia API URL:', AIRIA_API_URL);
console.log('  - API Key:', AIRIA_API_KEY ? `${AIRIA_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('  - Timeout:', REQUEST_TIMEOUT / 1000, 'seconds');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Backend server is running',
    timestamp: new Date().toISOString(),
    config: {
      airiaUrl: AIRIA_API_URL,
      hasApiKey: !!AIRIA_API_KEY,
      timeout: REQUEST_TIMEOUT
    }
  });
});

// Test endpoint to verify Airia connectivity
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log('[Test] Testing connection to Airia API...');
    console.log('[Test] URL:', AIRIA_API_URL);
    console.log('[Test] API Key:', AIRIA_API_KEY ? `${AIRIA_API_KEY.substring(0, 10)}...` : 'NOT SET');
    
    const testPayload = {
      userInput: 'test connection',
      asyncOutput: false
    };
    
    const startTime = Date.now();
    const response = await axios.post(
      AIRIA_API_URL,
      testPayload,
      {
        headers: {
          'X-API-KEY': AIRIA_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30 second timeout for test
        validateStatus: () => true // Accept any status code
      }
    );
    const duration = Date.now() - startTime;
    
    console.log('[Test] Response received in', duration, 'ms');
    console.log('[Test] Status:', response.status);
    console.log('[Test] Headers:', JSON.stringify(response.headers, null, 2));
    
    res.json({
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      duration: duration,
      data: response.data,
      message: response.status >= 200 && response.status < 300 
        ? 'Connection successful' 
        : 'Connection failed with error status'
    });
  } catch (error) {
    console.error('[Test] Connection test failed:', error.message);
    console.error('[Test] Error code:', error.code);
    console.error('[Test] Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: {
        isTimeout: error.code === 'ECONNABORTED',
        isNetworkError: error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED',
        hasResponse: !!error.response,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      }
    });
  }
});

// Poll for async result
app.get('/api/poll/:executionId', async (req, res) => {
  const { executionId } = req.params;
  const pollUrl = `https://api.airia.ai/v2/PipelineExecution/${executionId}`;
  
  try {
    console.log(`[Poll] Checking status for execution: ${executionId}`);
    
    const response = await axios.get(pollUrl, {
      headers: {
        'X-API-KEY': AIRIA_API_KEY,
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log(`[Poll] Status: ${response.data.status}`);
    
    res.json({
      status: response.data.status,
      result: response.data.result,
      data: response.data
    });
  } catch (error) {
    console.error(`[Poll] Error:`, error.message);
    res.status(500).json({
      error: 'Failed to poll execution status',
      message: error.message
    });
  }
});

// Proxy endpoint for Airia
app.post('/api/learn', async (req, res) => {
  const requestId = Date.now().toString(36);
  const startTime = Date.now();
  
  try {
    const { userInput } = req.body;

    if (!userInput) {
      console.error(`[${requestId}] Missing userInput in request body`);
      return res.status(400).json({ 
        error: 'userInput is required',
        requestId 
      });
    }

    console.log(`[${requestId}] ========== NEW REQUEST ==========`);
    console.log(`[${requestId}] User Input: ${userInput}`);
    console.log(`[${requestId}] Target URL: ${AIRIA_API_URL}`);
    console.log(`[${requestId}] API Key: ${AIRIA_API_KEY ? AIRIA_API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`[${requestId}] Timeout: ${REQUEST_TIMEOUT}ms`);

    const payload = {
      userInput: userInput,
      asyncOutput: false // Airia returns full SSE stream immediately
    };
    
    console.log(`[${requestId}] Request payload:`, JSON.stringify(payload, null, 2));
    console.log(`[${requestId}] Sending request to Airia...`);

    // Make request to Airia with enhanced error handling
    const response = await axios.post(
      AIRIA_API_URL,
      payload,
      {
        headers: {
          'X-API-KEY': AIRIA_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: REQUEST_TIMEOUT,
        validateStatus: (status) => status < 600 // Don't throw on any status < 600
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Response received in ${duration}ms`);
    console.log(`[${requestId}] Status: ${response.status}`);
    console.log(`[${requestId}] Response data:`, JSON.stringify(response.data, null, 2));
    
    // Check if response was successful
    if (response.status >= 400) {
      console.error(`[${requestId}] ❌ Airia returned error status ${response.status}`);
      console.error(`[${requestId}] Error response:`, JSON.stringify(response.data, null, 2));
      return res.status(response.status).json({
        error: 'Airia API Error',
        status: response.status,
        message: response.data?.message || response.data,
        details: response.data,
        requestId,
        duration
      });
    }

    // Airia returns the result in response.data.result as a JSON string
    let finalResult = null;
    
    if (response.data.result && typeof response.data.result === 'string') {
      console.log(`[${requestId}] Parsing result JSON string from Airia...`);
      try {
        finalResult = JSON.parse(response.data.result);
        console.log(`[${requestId}] Successfully parsed result`);
        console.log(`[${requestId}] Result keys:`, Object.keys(finalResult));
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse result JSON:`, parseError.message);
        console.error(`[${requestId}] First 500 chars:`, response.data.result.substring(0, 500));
      }
    }
    
    console.log(`[${requestId}] ========== REQUEST COMPLETE (${duration}ms) ==========`);

    // Return the parsed data to frontend
    res.json({ 
      data: finalResult || response.data,
      requestId,
      duration 
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ ERROR after ${duration}ms`);
    console.error(`[${requestId}] Error Type:`, error.constructor.name);
    console.error(`[${requestId}] Error Message:`, error.message);
    console.error(`[${requestId}] Error Code:`, error.code);
    
    if (error.response) {
      // Airia returned an error response
      console.error(`[${requestId}] Response Status:`, error.response.status);
      console.error(`[${requestId}] Response Headers:`, JSON.stringify(error.response.headers, null, 2));
      console.error(`[${requestId}] Response Data:`, JSON.stringify(error.response.data, null, 2));
      
      return res.status(error.response.status).json({
        error: 'Airia API Error',
        status: error.response.status,
        message: error.response.data?.message || 'API returned an error',
        details: error.response.data,
        requestId,
        duration
      });
    } else if (error.request) {
      // Request made but no response received
      console.error(`[${requestId}] No response received from Airia`);
      console.error(`[${requestId}] Request details:`, {
        url: AIRIA_API_URL,
        method: 'POST',
        timeout: REQUEST_TIMEOUT,
        hasApiKey: !!AIRIA_API_KEY
      });
      
      // Provide specific error messages based on error code
      let errorMessage = 'No response from Airia API';
      let troubleshooting = [];
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = `Request timeout after ${REQUEST_TIMEOUT / 1000} seconds`;
        troubleshooting = [
          'The request took too long to complete',
          'Try increasing REQUEST_TIMEOUT in .env',
          'Check if Airia API is experiencing high load'
        ];
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'DNS lookup failed - cannot resolve Airia API hostname';
        troubleshooting = [
          'Check your internet connection',
          'Verify the AIRIA_API_URL is correct',
          'Check if the domain exists and is accessible'
        ];
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused by Airia API server';
        troubleshooting = [
          'The server is not accepting connections',
          'Check if the API endpoint is correct',
          'Verify the service is running'
        ];
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Connection timeout - could not reach Airia API';
        troubleshooting = [
          'Check your internet connection',
          'Verify firewall settings',
          'Check if the API is accessible from your network'
        ];
      }
      
      console.error(`[${requestId}] Troubleshooting:`, troubleshooting);
      
      return res.status(503).json({
        error: 'Service Unavailable',
        message: errorMessage,
        code: error.code,
        troubleshooting,
        requestId,
        duration,
        config: {
          url: AIRIA_API_URL,
          timeout: REQUEST_TIMEOUT,
          hasApiKey: !!AIRIA_API_KEY
        }
      });
    } else {
      // Error in request setup
      console.error(`[${requestId}] Request setup error:`, error.stack);
      
      return res.status(500).json({
        error: 'Server Error',
        message: error.message,
        requestId,
        duration
      });
    }
  }
});

// Quiz feedback endpoint
app.post('/api/quiz-feedback', async (req, res) => {
  const requestId = `feedback-${Date.now()}`;
  const startTime = Date.now();
  
  try {
    const { title, responses } = req.body;
    
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'responses array is required',
        requestId
      });
    }
    
    console.log(`[${requestId}] ========== QUIZ FEEDBACK REQUEST ==========`);
    console.log(`[${requestId}] Title: ${title}`);
    console.log(`[${requestId}] Total responses: ${responses.length}`);
    
    // Use the specific execution ID from the curl example
    const FEEDBACK_EXECUTION_ID = 'a6d69c49-12f9-47e9-8dd4-ab86d7dd5794';
    const feedbackUrl = `https://api.airia.ai/v2/PipelineExecution/${FEEDBACK_EXECUTION_ID}`;
    
    const payload = {
      title: title || "Quiz Feedback",
      responses: responses
    };
    
    console.log(`[${requestId}] Sending feedback to Airia...`);
    console.log(`[${requestId}] Payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      feedbackUrl,
      payload,
      {
        headers: {
          'X-API-KEY': AIRIA_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: REQUEST_TIMEOUT
      }
    );
    
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Feedback sent successfully (${duration}ms)`);
    console.log(`[${requestId}] Response status: ${response.status}`);
    
    // Return success
    res.json({
      success: true,
      message: 'Quiz feedback submitted successfully',
      requestId,
      duration
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ ERROR after ${duration}ms`);
    console.error(`[${requestId}] Error:`, error.message);
    
    if (error.response) {
      console.error(`[${requestId}] Response status:`, error.response.status);
      console.error(`[${requestId}] Response data:`, error.response.data);
    }
    
    res.status(500).json({
      error: 'Failed to submit quiz feedback',
      message: error.message,
      requestId,
      duration
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Backend proxy server started successfully');
  console.log('='.repeat(60));
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📡 Airia endpoint: ${AIRIA_API_URL}`);
  console.log(`🔑 API Key: ${AIRIA_API_KEY ? AIRIA_API_KEY.substring(0, 10) + '...' : 'NOT SET'}`);
  console.log(`⏱️  Timeout: ${REQUEST_TIMEOUT / 1000} seconds`);
  console.log('\nAvailable endpoints:');
  console.log('  - GET  /health              - Health check');
  console.log('  - GET  /api/test-connection - Test Airia connectivity');
  console.log('  - POST /api/learn           - Proxy to Airia');
  console.log('  - POST /api/quiz-feedback   - Submit quiz feedback');
  console.log('\n💡 Test connection: curl http://localhost:' + PORT + '/api/test-connection');
  console.log('='.repeat(60) + '\n');
});
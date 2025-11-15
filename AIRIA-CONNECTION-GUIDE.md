# How to Connect Frontend to Airia Agent

## 📋 Prerequisites

Get these details from your friend who created the Airia agent:

1. ✅ **Agent URL/Endpoint**
2. ✅ **Authentication method** (API key, Bearer token, or none)
3. ✅ **Request format** (what field name: `query`, `message`, or `input`)
4. ✅ **Response format** (should match the schema in AGENT-INTEGRATION-SUMMARY.md)

## 🔧 Step-by-Step Connection

### Step 1: Get Airia Agent Details

Ask your friend for:

```
Agent URL: https://api.airia.com/agents/[agent-id]/chat
OR
Agent URL: https://[custom-domain]/api/learn

Authentication: Bearer token / API Key / None
Request field: query / message / input
```

### Step 2: Update Environment Variables

Edit your `.env` file:

```bash
# Airia Agent Endpoint
REACT_APP_API_URL=https://api.airia.com/agents/your-agent-id

# Authentication Token (if required)
REACT_APP_API_TOKEN=your_airia_api_token

# Freepik API Key (already configured)
REACT_APP_FREEPIK_API_KEY=FPSX505e93e58f374a1aad6597bd34538572
```

### Step 3: Update API Endpoint Path (if needed)

If the Airia agent uses a different path than `/api/learn`, update line 5 in `src/services/api.js`:

```javascript
// Change from:
const API_ENDPOINT = `${API_BASE_URL}/api/learn`;

// To (examples):
const API_ENDPOINT = `${API_BASE_URL}/chat`;
// OR
const API_ENDPOINT = `${API_BASE_URL}/query`;
// OR
const API_ENDPOINT = `${API_BASE_URL}`;  // If agent is at root
```

### Step 4: Adjust Request Format (if needed)

If Airia agent expects different field names, update lines 12-18 in `src/services/api.js`:

**Option A: Uses "query" (current default)**
```javascript
const response = await axios.post(API_ENDPOINT, {
  query: query
});
```

**Option B: Uses "message"**
```javascript
const response = await axios.post(API_ENDPOINT, {
  message: query
});
```

**Option C: Uses "input"**
```javascript
const response = await axios.post(API_ENDPOINT, {
  input: query
});
```

**Option D: Nested format**
```javascript
const response = await axios.post(API_ENDPOINT, {
  data: {
    query: query
  }
});
```

### Step 5: Configure Authentication

The code already supports Bearer token authentication. If your friend's agent uses a different method:

**Current (Bearer Token):**
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
}
```

**Alternative (API Key Header):**
```javascript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': process.env.REACT_APP_API_TOKEN
}
```

**Alternative (Airia-Specific):**
```javascript
headers: {
  'Content-Type': 'application/json',
  'Airia-API-Key': process.env.REACT_APP_API_TOKEN
}
```

### Step 6: Remove Mock Data (When Ready)

Once the Airia agent is working, remove the mock data fallback in `src/services/api.js`:

**Delete lines 33-220** (the entire catch block with mock data)

Change from:
```javascript
  } catch (error) {
    console.error('API Error:', error);
    
    // TEMPORARY: Return mock data for testing
    console.log('Using mock data for testing...');
    return {
      data: {
        // ... mock data ...
      }
    };
  }
```

To:
```javascript
  } catch (error) {
    console.error('API Error:', error);
    throw error;  // Let the UI handle the error
  }
```

### Step 7: Test the Connection

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Open browser:** http://localhost:3000

3. **Type a test query:** "Explain React"

4. **Check browser console** (F12) for:
   - Request being sent
   - Response received
   - Any errors

## 🔍 Troubleshooting

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:** Your friend needs to enable CORS on the Airia agent:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Issue: 401 Unauthorized

**Error:** `Request failed with status code 401`

**Solution:** 
- Check if `REACT_APP_API_TOKEN` is set correctly in `.env`
- Verify the authentication header format with your friend
- Restart the app after changing `.env` file

### Issue: 404 Not Found

**Error:** `Request failed with status code 404`

**Solution:**
- Verify the API endpoint URL is correct
- Check if the path `/api/learn` is correct for the Airia agent
- Ask your friend for the exact endpoint path

### Issue: Wrong Response Format

**Error:** Content doesn't display properly

**Solution:**
- Check browser console for the response structure
- Verify the response matches the expected format:
  ```json
  {
    "data": {
      "topic": "...",
      "chapters": [...],
      "quiz": [...]
    }
  }
  ```
- If response is nested differently, you may need to adjust the response handling

## 📊 Expected Request/Response

### Request to Airia Agent:
```json
POST https://api.airia.com/agents/your-agent-id/api/learn
Content-Type: application/json
Authorization: Bearer your_token

{
  "query": "Explain React hooks"
}
```

### Expected Response from Airia Agent:
```json
{
  "data": {
    "topic": "React hooks",
    "chapters": [
      {
        "number": 1,
        "title": "Introduction to Hooks",
        "summary": "Overview of React hooks",
        "scenes": [
          {
            "concept_label": "What are Hooks?",
            "educational_text": "Hooks are functions...",
            "duration_sec": 8,
            "image_prompt": "Create a diagram of React hooks"
          }
        ]
      }
    ],
    "quiz": [
      {
        "topic": "React hooks",
        "question": "What is useState?",
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "answer": "A",
        "rationale": "Explanation..."
      }
    ]
  }
}
```

## 🚀 Quick Start Commands

```bash
# 1. Update .env with Airia agent URL
echo "REACT_APP_API_URL=https://your-airia-agent-url" > .env
echo "REACT_APP_API_TOKEN=your_token" >> .env
echo "REACT_APP_FREEPIK_API_KEY=FPSX505e93e58f374a1aad6597bd34538572" >> .env

# 2. Install dependencies (if not done)
npm install

# 3. Start the app
npm start

# 4. Open browser
# http://localhost:3000
```

## 📞 What to Ask Your Friend

Send this to your friend who created the Airia agent:

```
Hi! I need the following details to connect my frontend to your Airia agent:

1. Agent URL/Endpoint: _________________
2. Authentication method: Bearer token / API Key / None
3. If auth required, the token: _________________
4. Request format - which field name: query / message / input
5. Does it support CORS? Yes / No

The frontend expects this JSON response format:
{
  "data": {
    "topic": "...",
    "chapters": [{ "number": 1, "title": "...", "summary": "...", "scenes": [...] }],
    "quiz": [{ "question": "...", "options": [...], "answer": "A", "rationale": "..." }]
  }
}

Can you confirm your agent returns data in this format?
```

## ✅ Checklist

- [ ] Got agent URL from friend
- [ ] Got authentication token (if needed)
- [ ] Updated `.env` file
- [ ] Updated endpoint path in `api.js` (if needed)
- [ ] Updated request format (if needed)
- [ ] Tested connection
- [ ] Verified response format
- [ ] Removed mock data (when working)
- [ ] Tested Freepik image generation
- [ ] Tested quiz functionality

---

**Once connected, your frontend will automatically:**
- ✅ Send user queries to Airia agent
- ✅ Display chapters and scenes
- ✅ Generate images from prompts via Freepik
- ✅ Show interactive quiz
- ✅ Handle all UI interactions

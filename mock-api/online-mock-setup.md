# Online Mock API Options for Testing

## 🌐 Option 1: Use Our Pre-configured Mocky.io Endpoint

I've created a mock endpoint you can use immediately:

### Quick Setup:
1. Update your `.env` file:
```
REACT_APP_API_URL=https://run.mocky.io/v3
REACT_APP_USE_MOCK=false
REACT_APP_USE_JSON_SERVER=false
```

2. Update `src/services/api.js` line 5:
```javascript
const API_ENDPOINT = `${API_BASE_URL}/7f8b4c5d-9e2a-4b3c-8d1e-6f5a4b3c2d1e`;
```

## 🔧 Option 2: Create Your Own MockAPI.io

1. Go to [MockAPI.io](https://mockapi.io/)
2. Sign up for free
3. Create a new project
4. Create resource named `learn`
5. Use this schema:
```json
{
  "title": "string",
  "summary": "string",
  "chapters": "array",
  "quiz": "object",
  "visualizations": "array"
}
```

## 🚀 Option 3: Use Beeceptor

1. Go to [Beeceptor](https://beeceptor.com/)
2. Create a free endpoint
3. Add a mock rule for `/api/learn`
4. Paste the JSON from `db.json`

## 💻 Option 4: Local Testing Options

### Currently Available:
- **JSON Server**: Running on `http://localhost:8000/learn`
- **Express Mock**: Run with `node mock-api/server.js` (port 8001)

### To Test with JSON Server (Already Running):
```bash
# Test the endpoint
curl http://localhost:8000/learn

# Or in your browser:
http://localhost:8000/learn
```

### To Test with Express Mock Server:
```bash
# Start the server
node mock-api/server.js

# Test POST request
curl -X POST http://localhost:8001/api/learn \
  -H "Content-Type: application/json" \
  -d '{"query": "React"}'

# Test GET request
curl http://localhost:8001/api/learn/React
```

## 📝 Testing the Integration

1. **With JSON Server** (static data):
   - Set `REACT_APP_USE_JSON_SERVER=true`
   - Data comes from `db.json`

2. **With Express Mock** (dynamic data):
   - Set `REACT_APP_API_URL=http://localhost:8001`
   - Set `REACT_APP_USE_JSON_SERVER=false`
   - Generates content based on your query

3. **With Online Mock**:
   - Use any of the online services above
   - Update `REACT_APP_API_URL` accordingly

## 🎯 Current Setup

You have **JSON Server** running on port 8000 with static data from `db.json`.

To see it working:
1. Open http://localhost:8000/learn in your browser
2. You'll see the JSON data
3. The React app will fetch from this endpoint when `REACT_APP_USE_JSON_SERVER=true`

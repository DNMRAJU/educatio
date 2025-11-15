# Integration Guide for Your Friend's API

## Quick Setup

### 1. Configure the API Endpoint

Edit `.env` file:
```
REACT_APP_API_URL=http://your-friends-api-url.com
```

If the endpoint path is different from `/api/learn`, update line 5 in `src/services/api.js`:
```javascript
const API_ENDPOINT = `${API_BASE_URL}/your-actual-path`;
```

### 2. Add Authentication (if required)

In `src/services/api.js`, uncomment and update line 22:
```javascript
'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
```

Then add to `.env`:
```
REACT_APP_API_TOKEN=your_token_here
```

### 3. Test the Integration

```bash
npm start
```

Type any query in the chat interface. The app will send:
```json
{
  "query": "user's question here"
}
```

## What Your Friend Needs to Provide

1. **API Endpoint URL**
2. **Authentication method** (if any)
3. **Response in the schema format** (see API-SCHEMA-DOCUMENTATION.md)

## Minimum Working Response

Your friend's API must return at least:
```json
{
  "data": {
    "title": "Topic Title",
    "summary": "Brief description",
    "chapters": [
      {
        "title": "Chapter 1",
        "content": "Content here"
      }
    ]
  }
}
```

## Testing Without the Real API

If the API isn't ready, your friend can:
1. Use Postman to mock the endpoint
2. Use MockAPI.io for online testing
3. Run the Express mock server in `mock-api/server.js`

## Troubleshooting

### CORS Issues
Your friend's API needs to allow CORS from your domain:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 404 Errors
- Check the API URL in `.env`
- Verify the endpoint path in `api.js`
- Ensure the API is running

### Empty Response
- Check the response structure matches the schema
- Verify `data` wrapper exists in response

## Files to Share with Your Friend

1. **API-SCHEMA-DOCUMENTATION.md** - Complete schema specification
2. **mock-api/server.js** - Example implementation
3. This guide

## Contact

The frontend is ready to integrate. Your friend just needs to:
1. Build an endpoint that accepts POST requests
2. Return JSON in the documented format
3. Provide the URL and any auth details

# Backend Proxy Setup Guide

## Current Issue: 401 Unauthorized

The backend is receiving a 401 error from Airia, which means the API key isn't being recognized.

## Solution

### Step 1: Create Backend .env File

Create a `.env` file in the `backend/` directory with the Airia API key:

```bash
cd backend
cat > .env << 'EOF'
AIRIA_API_KEY=ak-NjcxNTg4NDY3fDE3NjMyNDU2NjY4MDh8dGktYzJWeWRtbGpaVzV2ZHkxUGNHVnlJRkpsWjJsemRISmhkR2x2YmkxUWNtOW1aWE56YVc5dVlXdz18MXwyNzQyOTU0MTE1
PORT=5001
EOF
```

### Step 2: Restart Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Backend proxy server running on http://localhost:5001
📡 Airia endpoint: https://api.airia.ai/v2/PipelineExecution/...
🔑 API Key configured: Yes
[Backend] Airia API Key: ak-NjcxNTg4...
```

### Step 3: Test the Connection

In another terminal, test the backend:

```bash
curl -X POST http://localhost:5001/api/learn \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Quadratic Equations"}'
```

You should get a JSON response from Airia.

### Step 4: Frontend Configuration

The frontend is already configured to use the backend proxy at `http://localhost:5001`.

## Architecture

```
Frontend (http://localhost:3000)
    ↓ (calls /api/learn)
Backend Proxy (http://localhost:5001)
    ↓ (forwards with X-API-KEY header)
Airia API (https://api.airia.ai/...)
```

## Files

- **Backend**: `/backend/server.js` - Express proxy server
- **Frontend API**: `/src/services/api.js` - Calls backend
- **Frontend Config**: `/.env` - Points to backend URL

## Troubleshooting

### Still Getting 401?

1. Check backend logs for API key:
   ```
   [Backend] Airia API Key: ak-NjcxNTg4...
   ```

2. Verify the key in `backend/.env` matches:
   ```
   ak-NjcxNTg4NDY3fDE3NjMyNDU2NjY4MDh8dGktYzJWeWRtbGpaVzV2ZHkxUGNHVnlJRkpsWjJsemRISmhkR2x2YmkxUWNtOW1aWE56YVc5dVlXdz18MXwyNzQyOTU0MTE1
   ```

3. Check if Airia API key has expired or been revoked

### Backend Not Starting?

```bash
# Kill any process on port 5001
lsof -i :5001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Start backend
cd backend && npm start
```

### Frontend Can't Connect to Backend?

Make sure:
1. Backend is running on port 5001
2. Frontend `.env` has: `REACT_APP_BACKEND_URL=http://localhost:5001`
3. Restart frontend after changing `.env`

## Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Both should be running simultaneously.

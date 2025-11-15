# Mock API Testing Options

## Option 1: JSON Server (Local - Currently Running)
- **URL**: http://localhost:8000/learn
- **Method**: GET
- **Data**: Static from db.json
- **How to use**: Set `REACT_APP_USE_JSON_SERVER=true` in .env

## Option 2: MockAPI.io (Online)
1. Go to https://mockapi.io/
2. Create a free account
3. Create a new project
4. Add endpoint `/learn` with the schema from db.json
5. Update `REACT_APP_API_URL` with your MockAPI URL

## Option 3: JSONPlaceholder (Online - Limited)
- **URL**: https://jsonplaceholder.typicode.com/posts
- Can be used for basic testing but doesn't match our schema

## Option 4: Mocky.io (Online - Static)
1. Go to https://designer.mocky.io/
2. Paste the JSON from db.json
3. Generate a URL
4. Use that URL in your API configuration

## Option 5: Local Express Server
Run the included Express server:
```bash
node mock-api/server.js
```

## Current Setup
JSON Server is running on port 8000 with data from db.json

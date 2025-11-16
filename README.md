# E-Learning Platform with AI Agent Integration

A modern, interactive e-learning platform that integrates with AI agents (like Airia) to deliver personalized educational content with automatic image generation, quizzes, and structured learning paths.

## 🌟 Features

### Core Functionality
- **🤖 AI Agent Integration**: Seamlessly connects to Airia or custom AI agents for content generation
- **🎨 Automatic Image Generation**: Integrates with Freepik API to generate educational images from prompts
- **📚 Structured Learning**: Displays content in chapters with scenes and educational text
- **🎯 Interactive Quizzes**: Built-in quiz system with instant feedback and explanations
- **💬 Chat Interface**: Modern, ChatGPT-like interface for natural interaction
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **💾 Chat History**: Saves and loads previous learning sessions

### User Experience
- **Sidebar Navigation**: AWS-style sidebar with chapter organization
- **Scene-based Display**: Content broken into digestible scenes with duration tracking
- **Loading States**: Smooth loading animations for content and images
- **Error Handling**: Graceful fallbacks when APIs are unavailable
- **Accessibility**: Alt text support for generated images

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Airia API key (or custom agent endpoint)
- Freepik API key (for image generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd windsurf-project
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Create `.env` in the root directory:
   ```bash
   REACT_APP_BACKEND_URL=http://localhost:5001
   REACT_APP_FREEPIK_API_KEY=your_freepik_api_key
   ```

   Create `backend/.env`:
   ```bash
   AIRIA_API_KEY=your_airia_api_key
   PORT=5001
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   npm start
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📋 API Integration

### Supported Agent Formats

The platform supports multiple agent response formats:

#### Format 1: Airia Agent (Current)
```json
{
  "data": {
    "topic": "Topic Name",
    "chapters": [
      {
        "number": 1,
        "title": "Chapter Title",
        "summary": "Chapter summary",
        "scenes": [
          {
            "concept_label": "Concept Label",
            "educational_text": "Educational content here",
            "duration_sec": 8,
            "image_prompt": "Prompt for image generation",
            "onscreen_text": "Highlighted text",
            "alt_text": "Image description"
          }
        ]
      }
    ],
    "quiz": [
      {
        "topic": "Quiz topic",
        "question": "Question text?",
        "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
        "answer": "A",
        "rationale": "Explanation of correct answer"
      }
    ]
  }
}
```

#### Format 2: Legacy Format (Backward Compatible)
```json
{
  "data": {
    "title": "Topic Title",
    "summary": "Brief summary",
    "chapters": [
      {
        "title": "Chapter Title",
        "content": "Chapter content",
        "subheadings": [
          {
            "title": "Subheading",
            "content": "Subheading content"
          }
        ]
      }
    ],
    "quiz": {
      "questions": [
        {
          "question": "Question text?",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Explanation"
        }
      ]
    }
  }
}
```

### Connecting Your Own Agent

1. **Update Backend Configuration**
   
   Edit `backend/server.js` to point to your agent:
   ```javascript
   const AIRIA_ENDPOINT = 'https://your-agent-url.com/api/endpoint';
   ```

2. **Configure Authentication**
   
   Update headers in `backend/server.js`:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'X-API-KEY': process.env.YOUR_API_KEY_NAME
   }
   ```

3. **Adjust Request Format**
   
   Modify the request body to match your agent's expected format:
   ```javascript
   const requestBody = {
     query: userInput,  // or message, input, etc.
     // Add any other required fields
   };
   ```

## 🎨 Freepik Image Generation

### How It Works
1. Agent returns scenes with `image_prompt` or `visual_prompt`
2. Frontend automatically calls Freepik API for each prompt
3. Displays loading spinner while generating (5-10 seconds)
4. Shows generated image when ready
5. Graceful fallback if generation fails

### Configuration
- **API Key**: Set in `.env` as `REACT_APP_FREEPIK_API_KEY`
- **Endpoint**: `https://api.freepik.com/v1/ai/text-to-image/seedream-v4`
- **Polling**: Checks every 2 seconds for completion
- **Timeout**: 2 minutes max per image

### Getting a Freepik API Key
1. Sign up at [Freepik API](https://www.freepik.com/api)
2. Create a new project
3. Copy your API key
4. Add to `.env` file

## 🎯 Quiz System

### Features
- **Multiple Answer Formats**: Supports both letter-based (A, B, C, D) and numeric (0, 1, 2, 3) answers
- **Batch Submission**: Users answer all questions before submitting
- **Instant Feedback**: Shows correct/incorrect answers with color coding
- **Explanations**: Displays rationale/explanation for each answer
- **Score Tracking**: Shows final score after submission

### Quiz Behavior
1. User answers all questions
2. Submit button enabled only when all answered
3. Results shown all at once after submission
4. Green for correct answers, red for incorrect
5. Rationale displayed for learning

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/
│   ├── ChatInterface.js       # Main chat UI
│   ├── ContentDisplay.js      # Content renderer with sidebar
│   ├── SceneDisplay.js        # Individual scene display
│   ├── QuizComponent.js       # Quiz functionality
│   ├── ChatHistory.js         # Chat history sidebar
│   └── VisualizationComponent.js  # Charts (if needed)
├── services/
│   └── api.js                 # API calls (backend + Freepik)
├── utils/
│   └── localStorage.js        # Chat history persistence
└── App.js                     # Main app component
```

### Backend (Express)
```
backend/
├── server.js                  # Proxy server for Airia API
├── package.json
└── .env                       # Backend configuration
```

### Data Flow
```
User Query
    ↓
Frontend (React)
    ↓
Backend Proxy (Express)
    ↓
AI Agent (Airia/Custom)
    ↓
Backend Proxy
    ↓
Frontend
    ↓
For each image_prompt:
    ↓
Freepik API
    ↓
Display Content + Images
```

## 🔧 Configuration

### Frontend Environment Variables
```bash
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:5001

# Freepik API Key for image generation
REACT_APP_FREEPIK_API_KEY=your_freepik_api_key
```

### Backend Environment Variables
```bash
# Airia API Key
AIRIA_API_KEY=your_airia_api_key

# Server Port
PORT=5001
```

## 📁 Key Files

### Frontend
- **`src/services/api.js`**: API calls to backend and Freepik
- **`src/components/ChatInterface.js`**: Main chat interface
- **`src/components/ContentDisplay.js`**: Content layout with sidebar navigation
- **`src/components/SceneDisplay.js`**: Renders individual scenes with images
- **`src/components/QuizComponent.js`**: Quiz with answer validation
- **`src/components/ChatHistory.js`**: Chat history management
- **`src/utils/localStorage.js`**: Local storage utilities

### Backend
- **`backend/server.js`**: Express proxy server for Airia API
- **`backend/.env`**: Backend configuration

### Configuration
- **`.env`**: Frontend environment variables
- **`package.json`**: Frontend dependencies
- **`backend/package.json`**: Backend dependencies

## 🛠️ Development

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Building for Production

```bash
# Build frontend
npm run build

# The build folder contains optimized production files
```

### Testing the API Connection

Test backend proxy:
```bash
curl -X POST http://localhost:5001/api/learn \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Explain React hooks"}'
```

## 🐛 Troubleshooting

### Backend Issues

**401 Unauthorized**
- Check `AIRIA_API_KEY` in `backend/.env`
- Verify API key is valid and not expired
- Check backend logs for API key confirmation

**Backend Not Starting**
```bash
# Kill process on port 5001
lsof -i :5001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Restart backend
cd backend && npm start
```

### Frontend Issues

**CORS Errors**
- Ensure backend is running
- Check `REACT_APP_BACKEND_URL` in `.env`
- Verify backend CORS configuration

**Images Not Loading**
- Check `REACT_APP_FREEPIK_API_KEY` in `.env`
- Verify Freepik API key is valid
- Check browser console for Freepik API errors

**Content Not Displaying**
- Check browser console for API response
- Verify response format matches expected schema
- Check backend logs for errors

### General Issues

**Environment Variables Not Working**
```bash
# Restart the app after changing .env
# Frontend: Ctrl+C and npm start
# Backend: Ctrl+C and npm start
```

**Port Already in Use**
```bash
# Frontend (port 3000)
lsof -i :3000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Backend (port 5001)
lsof -i :5001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9
```

## 📚 Technologies Used

### Frontend
- **React 18**: Frontend framework
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls
- **React Markdown**: Markdown rendering
- **Recharts**: Chart library (optional)

### Backend
- **Express**: Node.js web framework
- **Axios**: HTTP client for API calls
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🎓 Usage Guide

### For Students

1. **Start a Learning Session**
   - Type your question or topic in the chat
   - Press Enter or click Send

2. **Navigate Content**
   - Use the sidebar to jump between chapters
   - Click on chapter titles to expand/collapse
   - Scroll through scenes sequentially

3. **View Generated Images**
   - Images generate automatically from prompts
   - Wait for loading spinner to complete
   - Images enhance understanding of concepts

4. **Take Quizzes**
   - Answer all questions
   - Click "Submit Quiz" when ready
   - Review explanations for each answer
   - See your final score

5. **Access Chat History**
   - Click the history icon to view past sessions
   - Click any previous chat to reload it
   - Delete unwanted history items

### For Developers

1. **Customize Styling**
   - Edit `tailwind.config.js` for theme changes
   - Modify component styles inline with Tailwind classes
   - Update `src/index.css` for global styles

2. **Add New Features**
   - Create new components in `src/components/`
   - Add API calls in `src/services/api.js`
   - Update state management in parent components

3. **Integrate New Agents**
   - Update backend endpoint in `backend/server.js`
   - Adjust request/response format as needed
   - Test with sample queries

## 🔒 Security Notes

- **API Keys**: Never commit `.env` files to version control
- **CORS**: Configure CORS properly for production
- **Authentication**: Implement proper authentication for production use
- **Rate Limiting**: Add rate limiting to prevent API abuse
- **Input Validation**: Validate user inputs on backend

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review browser console for errors
- Check backend logs for API issues
- Verify environment variables are set correctly

## 🎯 Roadmap

- [ ] Add user authentication
- [ ] Implement progress tracking
- [ ] Add bookmarking functionality
- [ ] Support for video content
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Mobile app version

---

**Status**: ✅ Ready for production use with Airia agent integration and Freepik image generation!

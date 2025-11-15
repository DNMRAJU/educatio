# E-Learning Chat Assistant Frontend

A modern, ChatGPT-like interface for an e-learning agent that helps users learn about any topic with structured content, quizzes, and visualizations.

## Features

- 🎨 **Modern Chat Interface**: Clean, responsive design similar to ChatGPT
- 📚 **Structured Learning Content**: Displays chapters, subheadings, and organized content
- 🎯 **Interactive Quizzes**: Built-in quiz component with instant feedback
- 📊 **Data Visualizations**: Support for various chart types (bar, line, pie, area, radar)
- 🔄 **Real-time Updates**: Smooth animations and loading states
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and update the API endpoint:

```
REACT_APP_API_URL=http://your-friend-api-endpoint.com
```

### 3. Update API Integration

Open `src/services/api.js` and modify:
- Update the `API_ENDPOINT` path to match your friend's API endpoint
- Add any required authentication headers
- Adjust the request payload structure to match the API requirements

### 4. Start the Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## API Response Format

The application expects the API to return data in the following format:

```json
{
  "title": "Topic Title",
  "summary": "Brief summary of the topic",
  "chapters": [
    {
      "title": "Chapter Title",
      "content": "Chapter content",
      "subheadings": [
        {
          "title": "Subheading Title",
          "content": "Subheading content"
        }
      ]
    }
  ],
  "quiz": {
    "questions": [
      {
        "question": "Question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": 0,
        "explanation": "Explanation for the answer"
      }
    ]
  },
  "visualizations": [
    {
      "type": "bar",
      "title": "Chart Title",
      "data": [
        {"name": "Label", "value": 100}
      ]
    }
  ]
}
```

## Customization

### Styling
- TailwindCSS configuration: `tailwind.config.js`
- Global styles: `src/index.css`
- Component-specific styles are inline using Tailwind classes

### Components
- `ChatInterface.js`: Main chat container
- `ContentDisplay.js`: Renders structured learning content
- `QuizComponent.js`: Interactive quiz functionality
- `VisualizationComponent.js`: Chart rendering

### API Service
- `src/services/api.js`: Contains all API calls and mock responses for testing

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Technologies Used

- **React 18**: Frontend framework
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Chart library for visualizations
- **React Markdown**: Markdown rendering
- **Axios**: HTTP client for API calls

## Development Notes

- The app includes mock responses for testing when the API is unavailable
- Remove mock responses in `src/services/api.js` for production
- The chat interface automatically scrolls to the latest message
- Quiz answers are validated client-side with immediate feedback
- Visualizations support multiple chart types with automatic rendering

## Troubleshooting

1. **API Connection Issues**: Check that the API endpoint is correct in `.env`
2. **CORS Errors**: Ensure your friend's API allows requests from your domain
3. **Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## License

MIT

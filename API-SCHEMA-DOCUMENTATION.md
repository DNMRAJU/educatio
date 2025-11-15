# API Schema Documentation for E-Learning Agent

## Endpoint Configuration

### Base URL
```
http://your-api-domain.com
```

### Main Endpoint
```
POST /api/learn
```

## Request Format

### Request Body
```json
{
  "query": "string - The topic/question the user wants to learn about"
}
```

### Optional Parameters (if needed)
```json
{
  "query": "string - Required",
  "user_id": "string - Optional",
  "session_id": "string - Optional", 
  "language": "string - Optional (default: 'en')",
  "difficulty": "string - Optional (easy|medium|hard)"
}
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <token> (if authentication is required)
```

## Expected Response Format

Your API should return a JSON response with the following structure:

### Complete Schema
```json
{
  "data": {
    "title": "string - Main title of the learning content",
    "summary": "string - Brief overview/introduction of the topic",
    
    "tableOfContents": [
      {
        "id": "string - Unique identifier",
        "title": "string - Section title",
        "hasChildren": "boolean - Whether this has subsections"
      }
    ],
    
    "chapters": [
      {
        "id": "string - Unique chapter ID",
        "title": "string - Chapter title",
        "content": "string - Chapter content (supports Markdown)",
        "subheadings": [
          {
            "title": "string - Subheading title",
            "content": "string - Subheading content (supports Markdown)"
          }
        ]
      }
    ],
    
    "quiz": {
      "title": "string - Quiz title (optional)",
      "description": "string - Quiz description (optional)",
      "questions": [
        {
          "question": "string - The question text",
          "options": [
            "string - Option 1",
            "string - Option 2", 
            "string - Option 3",
            "string - Option 4"
          ],
          "correctAnswer": "number - Index of correct option (0-based)",
          "explanation": "string - Explanation of the correct answer"
        }
      ]
    },
    
    "visualizations": [
      {
        "type": "string - Chart type (bar|line|pie|area|radar)",
        "title": "string - Chart title",
        "description": "string - Chart description (optional)",
        "data": [
          {
            "name": "string - Data point label",
            "value": "number - For simple charts",
            // OR for multi-series charts:
            "field1": "number",
            "field2": "number"
          }
        ],
        // For line charts with multiple lines:
        "lines": ["field1", "field2"],
        // For area charts:
        "areas": ["field1", "field2"],
        // For radar charts:
        "radars": [
          {
            "name": "string - Series name",
            "dataKey": "string - Data field key"
          }
        ]
      }
    ],
    
    "resources": [
      {
        "title": "string - Resource title",
        "url": "string - Resource URL",
        "type": "string - Resource type (docs|video|code|forum|cert)"
      }
    ],
    
    "relatedTopics": [
      "string - Related topic 1",
      "string - Related topic 2"
    ]
  }
}
```

## Minimal Required Response

At minimum, your API should return:

```json
{
  "data": {
    "title": "What is [Topic]?",
    "summary": "Brief description of the topic",
    "chapters": [
      {
        "title": "Introduction",
        "content": "Chapter content here"
      }
    ]
  }
}
```

## Example Response

```json
{
  "data": {
    "title": "What is React?",
    "summary": "React is a JavaScript library for building user interfaces.",
    
    "chapters": [
      {
        "id": "intro",
        "title": "Introduction to React",
        "content": "React is a declarative, efficient, and flexible JavaScript library...",
        "subheadings": [
          {
            "title": "Key Concepts",
            "content": "• Components\n• Props\n• State\n• Lifecycle"
          },
          {
            "title": "Why React?",
            "content": "React makes it painless to create interactive UIs..."
          }
        ]
      },
      {
        "id": "getting-started",
        "title": "Getting Started",
        "content": "To start with React, you need Node.js installed...",
        "subheadings": [
          {
            "title": "Installation",
            "content": "npm install react react-dom"
          }
        ]
      }
    ],
    
    "quiz": {
      "title": "Test Your React Knowledge",
      "questions": [
        {
          "question": "What is React?",
          "options": [
            "A database",
            "A JavaScript library",
            "A CSS framework",
            "An operating system"
          ],
          "correctAnswer": 1,
          "explanation": "React is a JavaScript library for building user interfaces."
        }
      ]
    },
    
    "visualizations": [
      {
        "type": "bar",
        "title": "React Popularity",
        "data": [
          { "name": "2020", "value": 70 },
          { "name": "2021", "value": 85 },
          { "name": "2022", "value": 92 }
        ]
      }
    ],
    
    "resources": [
      {
        "title": "Official React Documentation",
        "url": "https://react.dev",
        "type": "docs"
      }
    ]
  }
}
```

## Content Formatting Notes

### Markdown Support
All content fields support Markdown formatting:
- **Bold text**: `**text**`
- *Italic text*: `*text*`
- Lists: `• item` or `- item`
- Code: `` `code` ``
- Links: `[text](url)`

### Bullet Points
Use `\n•` for bullet points in content:
```
"content": "Key features:\n• Feature 1\n• Feature 2\n• Feature 3"
```

## Error Response Format

If an error occurs, return:
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE" 
}
```

## Implementation Notes

1. **Dynamic Content**: Generate content based on the `query` parameter
2. **Comprehensive Coverage**: Include multiple chapters for detailed learning
3. **Interactive Elements**: Always include a quiz when possible
4. **Visual Learning**: Add visualizations to enhance understanding
5. **Progressive Depth**: Start with overview, then go into details
6. **Practical Examples**: Include code examples and real-world applications

## Testing the API

### Using cURL
```bash
curl -X POST http://your-api-url/api/learn \
  -H "Content-Type: application/json" \
  -d '{"query": "React hooks"}'
```

### Using Postman
1. Set method to POST
2. URL: `http://your-api-url/api/learn`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "query": "React hooks"
}
```

## Frontend Integration

The frontend expects the response in the exact format above. The app will:
1. Display the title and summary
2. Create a sidebar navigation from chapters
3. Render subheadings as nested items
4. Display quiz interactively
5. Render visualizations as charts
6. Show resources as clickable links

## Contact

For any questions about the schema or integration, please refer to the frontend code in:
- `/src/components/ContentDisplay.js` - Main content renderer
- `/src/services/api.js` - API integration
- `/src/components/QuizComponent.js` - Quiz handler
- `/src/components/VisualizationComponent.js` - Chart renderer

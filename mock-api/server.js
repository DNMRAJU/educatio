const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8001;

app.use(cors());
app.use(express.json());

// Mock data with dynamic content based on query
const generateLearningContent = (query) => ({
  title: `What is ${query}?`,
  summary: `${query} is a comprehensive topic that encompasses various aspects of modern technology and learning.`,
  tableOfContents: [
    { id: "intro", title: "Introduction", hasChildren: true },
    { id: "fundamentals", title: `${query} Fundamentals`, hasChildren: true },
    { id: "advanced", title: "Advanced Concepts", hasChildren: true },
    { id: "practical", title: "Practical Applications", hasChildren: false }
  ],
  chapters: [
    {
      id: "intro",
      title: "Introduction",
      content: `Welcome to the comprehensive guide on ${query}. This chapter provides an overview of the key concepts.`,
      subheadings: [
        {
          title: "What You'll Learn",
          content: `• Core concepts of ${query}\n• Best practices and patterns\n• Real-world applications\n• Common challenges and solutions`
        },
        {
          title: "Prerequisites",
          content: "• Basic understanding of programming\n• Familiarity with web technologies\n• Enthusiasm to learn!"
        }
      ]
    },
    {
      id: "fundamentals",
      title: `${query} Fundamentals`,
      content: "Master the essential building blocks and core principles.",
      subheadings: [
        {
          title: "Core Concepts",
          content: `The fundamental concepts of ${query} include:\n• Architecture patterns\n• Data structures\n• Algorithms\n• Design principles`
        },
        {
          title: "Key Components",
          content: "• Component 1: Foundation layer\n• Component 2: Business logic\n• Component 3: Presentation layer\n• Component 4: Integration points"
        }
      ]
    }
  ],
  quiz: {
    title: "Knowledge Check",
    questions: [
      {
        question: `What is the primary purpose of ${query}?`,
        options: [
          "To solve complex problems",
          "To improve efficiency",
          "To enable scalability",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: `${query} serves multiple purposes in modern applications.`
      },
      {
        question: "Which approach is recommended for beginners?",
        options: [
          "Start with advanced topics",
          "Focus on fundamentals first",
          "Skip theory, go to practice",
          "Learn everything at once"
        ],
        correctAnswer: 1,
        explanation: "Building a strong foundation is crucial for long-term success."
      }
    ]
  },
  visualizations: [
    {
      type: "line",
      title: "Learning Progress Trajectory",
      data: [
        { name: "Day 1", knowledge: 10, confidence: 5 },
        { name: "Week 1", knowledge: 30, confidence: 20 },
        { name: "Week 2", knowledge: 50, confidence: 40 },
        { name: "Month 1", knowledge: 70, confidence: 65 },
        { name: "Month 2", knowledge: 85, confidence: 80 },
        { name: "Month 3", knowledge: 95, confidence: 92 }
      ],
      lines: ["knowledge", "confidence"]
    },
    {
      type: "bar",
      title: "Time Investment by Topic",
      data: [
        { name: "Theory", hours: 20 },
        { name: "Practice", hours: 40 },
        { name: "Projects", hours: 30 },
        { name: "Review", hours: 10 }
      ]
    },
    {
      type: "pie",
      title: "Learning Resources Distribution",
      data: [
        { name: "Documentation", value: 30 },
        { name: "Video Tutorials", value: 25 },
        { name: "Hands-on Labs", value: 35 },
        { name: "Community", value: 10 }
      ]
    }
  ],
  resources: [
    { title: "Official Documentation", url: "#docs", type: "docs" },
    { title: "Interactive Tutorials", url: "#tutorials", type: "tutorial" },
    { title: "Community Forum", url: "#forum", type: "forum" }
  ]
});

// POST endpoint that accepts query and returns learning content
app.post('/api/learn', (req, res) => {
  const { query } = req.body;
  const content = generateLearningContent(query || "Technology");
  
  // Simulate network delay
  setTimeout(() => {
    res.json(content);
  }, 500);
});

// GET endpoint for testing
app.get('/api/learn/:topic', (req, res) => {
  const { topic } = req.params;
  const content = generateLearningContent(topic || "Technology");
  res.json(content);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock API server is running' });
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`POST to http://localhost:${PORT}/api/learn`);
  console.log(`GET  to http://localhost:${PORT}/api/learn/:topic`);
});

import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your E-Learning Assistant. What would you like to learn about today?',
      timestamp: new Date()
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ChatInterface messages={messages} setMessages={setMessages} />
    </div>
  );
}

export default App;

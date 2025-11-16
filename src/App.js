import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ChatHistory from './components/ChatHistory';
import { 
  getSortedSessions, 
  getCurrentSessionId, 
  setCurrentSessionId,
  createNewSession,
  getChatSession,
  saveChatSession,
  deleteChatSession
} from './utils/localStorage';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize app - load or create session
  useEffect(() => {
    const initializeApp = () => {
      const savedSessionId = getCurrentSessionId();
      const allSessions = getSortedSessions();
      
      setSessions(allSessions);
      
      if (savedSessionId && allSessions.find(s => s.id === savedSessionId)) {
        // Load existing session
        const session = getChatSession(savedSessionId);
        if (session) {
          setCurrentSession(savedSessionId);
          setMessages(session.messages || []);
          return;
        }
      }
      
      // Create new session if none exists
      const newSession = createNewSession('New Chat');
      setCurrentSession(newSession.id);
      setMessages([{
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your E-Learning Assistant. What would you like to learn about today?',
        timestamp: new Date()
      }]);
      setSessions([newSession, ...allSessions]);
    };
    
    initializeApp();
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      const session = getChatSession(currentSessionId);
      if (session) {
        // Update title based on first user message (only if it's still "New Chat")
        const firstUserMessage = messages.find(m => m.type === 'user');
        let title = session.title;
        
        // Only update title if it's still "New Chat" and we have a user message
        if (session.title === 'New Chat' && firstUserMessage) {
          title = firstUserMessage.content.substring(0, 40).trim();
          // Add ellipsis if truncated
          if (firstUserMessage.content.length > 40) {
            title += '...';
          }
        }
        
        saveChatSession(currentSessionId, {
          ...session,
          title,
          messages
        });
        
        // Refresh sessions list
        setSessions(getSortedSessions());
      }
    }
  }, [messages, currentSessionId]);

  const handleNewChat = () => {
    // Check if current session is already empty (just has welcome message)
    const currentSession = getChatSession(currentSessionId);
    const hasUserMessages = currentSession?.messages?.some(m => m.type === 'user');
    
    // If current session is empty, don't create a new one
    if (currentSession && !hasUserMessages) {
      return;
    }
    
    const newSession = createNewSession('New Chat');
    setCurrentSession(newSession.id);
    setMessages([{
      id: Date.now(),
      type: 'bot',
      content: 'Hello! I\'m your E-Learning Assistant. What would you like to learn about today?',
      timestamp: new Date()
    }]);
    setSessions(getSortedSessions());
  };

  const handleSelectSession = (sessionId) => {
    const session = getChatSession(sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setCurrentSessionId(sessionId);
      setMessages(session.messages || []);
    }
  };

  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChatSession(sessionId);
      const remainingSessions = getSortedSessions();
      setSessions(remainingSessions);
      
      // If deleted current session, switch to another or create new
      if (sessionId === currentSessionId) {
        if (remainingSessions.length > 0) {
          handleSelectSession(remainingSessions[0].id);
        } else {
          handleNewChat();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ChatHistory
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <ChatInterface 
          messages={messages} 
          setMessages={setMessages}
          currentSessionId={currentSessionId}
        />
      </div>
    </div>
  );
}

export default App;

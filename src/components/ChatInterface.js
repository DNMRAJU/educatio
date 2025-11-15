import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ContentDisplay from './ContentDisplay';
import { sendLearningRequest } from '../services/api';

const ChatInterface = ({ messages, setMessages }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendLearningRequest(inputValue);
      
      // Backend returns { data: { topic, chapters, quiz }, requestId, duration }
      // Extract the actual content from response.data.data
      const contentData = response.data?.data || response.data;
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: contentData,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending request:', error);
      
      // Extract error details from backend response
      const errorData = error.response?.data;
      let errorText = 'I apologize, but I encountered an error while processing your request. Please try again.';
      
      if (errorData) {
        if (errorData.message) {
          errorText = errorData.message;
        }
        if (errorData.troubleshooting && Array.isArray(errorData.troubleshooting)) {
          errorText += '\n\nTroubleshooting:\n' + errorData.troubleshooting.map(tip => `• ${tip}`).join('\n');
        }
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: {
          error: true,
          message: errorText,
          details: errorData
        },
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">E-Learning Assistant</h1>
            <p className="text-sm text-gray-500">Ask me anything you want to learn</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
            >
              {message.type === 'user' ? (
                <div className="flex items-start space-x-2 max-w-2xl flex-row-reverse space-x-reverse">
                  <div className="p-2 rounded-full bg-primary-500">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-primary-500 text-white rounded-2xl shadow-sm px-4 py-3">
                    <p>{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <ContentDisplay content={message.content} />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start fade-in">
              <div className="flex items-start space-x-2 max-w-4xl">
                <div className="p-2 rounded-full bg-gray-300">
                  <Bot className="w-5 h-5 text-gray-700" />
                </div>
                <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                    <span className="text-gray-500">Generating learning content...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What would you like to learn about?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

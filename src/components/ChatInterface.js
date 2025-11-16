import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BookOpen, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ContentDisplay from './ContentDisplay';
import { sendLearningRequest } from '../services/api';
import { getQuizSummary } from '../utils/localStorage';

const ChatInterface = ({ messages, setMessages, currentSessionId }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e, customPrompt = null, includeQuizResults = false) => {
    e?.preventDefault();
    const promptToUse = customPrompt || inputValue;
    if (!promptToUse.trim() || isLoading) return;

    // Get quiz summary if continuing conversation
    let quizSummary = null;
    if (includeQuizResults && currentSessionId) {
      quizSummary = getQuizSummary(currentSessionId);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: promptToUse,
      timestamp: new Date(),
      originalPrompt: promptToUse, // Store original prompt for retakes
      includeQuizResults: includeQuizResults
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendLearningRequest(promptToUse, quizSummary);
      
      // Backend returns { data: { topic, chapters, quiz }, requestId, duration }
      // Extract the actual content from response.data.data
      const contentData = response.data?.data || response.data;
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: contentData,
        timestamp: new Date(),
        originalPrompt: promptToUse // Store original prompt for retakes
      };

      setMessages(prev => [...prev, botMessage]);
      setIsRetaking(false);
    } catch (error) {
      console.error('Error sending request:', error);
      
      // Extract error details from backend response
      const errorData = error.response?.data;
      const status = error.response?.status;
      let errorText = 'I apologize, but I encountered an error while processing your request. Please try again.';
      
      // Check for specific error types
      if (status === 402 || errorData?.httpStatusCode === 'PaymentRequired') {
        // Insufficient credits error
        errorText = '⚠️ Insufficient Credits\n\n';
        errorText += errorData?.validationResult?.errorMessage || 'You have run out of API credits.';
        errorText += '\n\nPlease check your account balance or contact support to continue using the learning assistant.';
      } else if (status === 401 || status === 403) {
        // Authentication/Authorization error
        errorText = '🔒 Authentication Error\n\n';
        errorText += 'There was an issue with your authentication. Please check your API credentials.';
      } else if (status >= 500) {
        // Server error
        errorText = '🔧 Server Error\n\n';
        errorText += 'The server is experiencing issues. Please try again in a few moments.';
      } else if (errorData) {
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
          details: errorData,
          statusCode: status
        },
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsRetaking(false);
      inputRef.current?.focus();
    }
  };

  const handleRetakeCourse = (originalPrompt) => {
    setIsRetaking(true);
    setIsLoading(true);
    // Call handleSubmit with the original prompt
    handleSubmit(null, originalPrompt);
  };

  const handleContinueLearning = () => {
    const quizSummary = getQuizSummary(currentSessionId);
    if (quizSummary) {
      const prompt = `I want to continue learning. I've completed a quiz with ${quizSummary.score}/${quizSummary.totalQuestions} correct answers. Please help me improve on the topics I struggled with.`;
      handleSubmit(null, prompt, true);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white px-8 py-4 shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between max-w-full mx-auto px-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 tracking-tight">E-Learning Assistant</h1>
              <p className="text-xs text-gray-500">Ask me anything you want to learn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50">
        <div className="space-y-5 max-w-full mx-auto px-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
            >
              {message.type === 'user' ? (
                <div className="flex items-start space-x-3 max-w-4xl ml-auto flex-row-reverse space-x-reverse">
                  <div className="p-1.5 rounded-full bg-cyan-500 shadow-sm flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-cyan-500 text-white rounded-2xl rounded-tr-sm shadow-sm px-4 py-3">
                    <p className="leading-relaxed text-sm">{message.content}</p>
                    {message.includeQuizResults && (
                      <div className="mt-2 pt-2 border-t border-cyan-400">
                        <p className="text-xs text-cyan-100 flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Including quiz results for personalized learning
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <ContentDisplay 
                    content={message.content}
                    onRetakeCourse={() => handleRetakeCourse(message.originalPrompt)}
                    originalPrompt={message.originalPrompt}
                    sessionId={currentSessionId}
                  />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start fade-in">
              <div className="flex items-start space-x-3 max-w-4xl">
                <div className="p-1.5 rounded-full bg-gray-300 shadow-sm flex-shrink-0">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                    <span className="text-gray-700 text-sm font-medium">
                      {isRetaking ? 'Generating learning content...' : 'Generating personalized learning content...'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">This typically takes 4-6 minutes for detailed content</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 px-8 py-5 shadow-sm">
        <form onSubmit={handleSubmit} className="max-w-full mx-auto px-4">
          {/* Continue Learning Button */}
          {currentSessionId && getQuizSummary(currentSessionId) && (
            <div className="mb-3">
              <button
                type="button"
                onClick={handleContinueLearning}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Continue Learning</span>
              </button>
            </div>
          )}
          
          <div className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What would you like to learn about?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-800 text-sm placeholder-gray-400 bg-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-5 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const ChatHistory = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  isOpen,
  onToggle 
}) => {
  const [hoveredSession, setHoveredSession] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateTitle = (title, maxLength = 35) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 shadow-sm ${
          isOpen ? 'w-72' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold flex items-center text-gray-800 tracking-wide">
                <MessageSquare className="w-4 h-4 mr-2 text-cyan-500" />
                CHAT HISTORY
              </h2>
              {/* Toggle Button - Moved inside sidebar */}
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-all"
                title="Close sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full px-4 py-2.5 bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto py-3 bg-gray-50">
            {sessions.length === 0 ? (
              <div className="px-4 py-12 text-center text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20 text-cyan-500" />
                <p className="text-sm font-medium text-gray-600">No conversations yet</p>
                <p className="text-xs mt-1 text-gray-400">Start learning something new</p>
              </div>
            ) : (
              <div className="space-y-1.5 px-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                  >
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
                        currentSessionId === session.id
                          ? 'bg-cyan-50 border border-cyan-200 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-8">
                          <p className={`font-medium text-sm truncate leading-snug ${
                            currentSessionId === session.id ? 'text-cyan-700' : 'text-gray-800'
                          }`}>
                            {truncateTitle(session.title)}
                          </p>
                          <div className={`flex items-center mt-1.5 text-xs ${
                            currentSessionId === session.id ? 'text-cyan-600' : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(session.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Delete Button - Outside the session button */}
                    {hoveredSession === session.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md transition-colors hover:bg-red-100 bg-white text-red-600 shadow-sm z-10"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="text-xs text-gray-400 text-center">
              <p className="flex items-center justify-center">
                <span className="mr-1.5">💾</span>
                <span>Saved locally on your device</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - Outside sidebar when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
          title="Open sidebar"
        >
          <ChevronRight className="w-5 h-5 text-cyan-500" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default ChatHistory;

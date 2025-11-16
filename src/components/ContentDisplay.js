import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, BookOpen, FileText, HelpCircle, BarChart3, Menu, X, Home, Book, Circle } from 'lucide-react';
import QuizComponent from './QuizComponent';
import VisualizationComponent from './VisualizationComponent';
import SceneDisplay from './SceneDisplay';
import ReactMarkdown from 'react-markdown';

const ContentDisplay = ({ content, onRetakeCourse, originalPrompt }) => {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [selectedSection, setSelectedSection] = useState({ type: 'overview' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-select first chapter on load
  useEffect(() => {
    if (content?.chapters?.length > 0 && selectedSection.type === 'overview') {
      setSelectedSection({ type: 'chapter', chapterIndex: 0 });
      setExpandedChapters({ 0: true });
    }
  }, [content, selectedSection.type]);

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex]
    }));
  };

  const selectContent = (type, chapterIndex = null, subheadingIndex = null) => {
    setSelectedSection({ type, chapterIndex, subheadingIndex });
    if (chapterIndex !== null) {
      setExpandedChapters(prev => ({ ...prev, [chapterIndex]: true }));
    }
  };

  // Handle simple string content
  if (typeof content === 'string') {
    return (
      <div className="px-4 py-3">
        <ReactMarkdown className="prose prose-sm max-w-none">
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Handle error messages
  if (content?.error) {
    return (
      <div className="px-4 py-3">
        <p className="text-red-600">{content.message}</p>
      </div>
    );
  }

  // Get current content to display
  const getCurrentContent = () => {
    if (selectedSection.type === 'overview') {
      return {
        title: content?.title,
        content: content?.summary
      };
    }
    
    if (selectedSection.type === 'quiz' && content?.quiz) {
      return { isQuiz: true };
    }
    
    if (selectedSection.type === 'visualizations' && content?.visualizations) {
      return { isVisualization: true };
    }
    
    if (selectedSection.type === 'chapter' && content?.chapters) {
      const chapter = content.chapters[selectedSection.chapterIndex];
      if (selectedSection.subheadingIndex !== null && chapter?.subheadings) {
        const subheading = chapter.subheadings[selectedSection.subheadingIndex];
        return {
          title: subheading?.title,
          content: subheading?.content
        };
      }
      return {
        title: chapter?.title,
        number: chapter?.number,
        summary: chapter?.summary,
        content: chapter?.content,
        scenes: chapter?.scenes // New format support
      };
    }
    
    return null;
  };

  const currentContent = getCurrentContent();

  // Handle structured learning content
  return (
    <div className="w-full flex relative bg-white min-h-screen">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Left Sidebar Navigation */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative top-0 left-0 h-screen w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-40`}>
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary-500" />
            Table of Contents
          </h2>
        </div>

        {/* Navigation Items */}
        <div className="py-2">
          {/* Overview */}
          <button
            onClick={() => selectContent('overview')}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center ${
              selectedSection.type === 'overview' ? 'bg-primary-50 border-l-4 border-primary-500' : ''
            }`}
          >
            <Home className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Overview</span>
          </button>

          {/* Chapters */}
          {content?.chapters && content.chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="border-b border-gray-100">
              {/* Chapter Header */}
              <div className="flex">
                <button
                  onClick={() => toggleChapter(chapterIndex)}
                  className="p-2 hover:bg-gray-100"
                >
                  {expandedChapters[chapterIndex] ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={() => selectContent('chapter', chapterIndex)}
                  className={`flex-1 px-2 py-2 text-left hover:bg-gray-100 transition-colors ${
                    selectedSection.type === 'chapter' && selectedSection.chapterIndex === chapterIndex && selectedSection.subheadingIndex === null
                      ? 'bg-primary-50 border-l-4 border-primary-500'
                      : ''
                  }`}
                >
                  <span className="text-sm font-medium text-gray-800">
                    {chapter.title}
                  </span>
                </button>
              </div>

              {/* Subheadings */}
              {expandedChapters[chapterIndex] && chapter.subheadings && (
                <div className="ml-8">
                  {chapter.subheadings.map((subheading, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => selectContent('chapter', chapterIndex, subIndex)}
                      className={`w-full px-4 py-1.5 text-left hover:bg-gray-100 transition-colors flex items-center ${
                        selectedSection.type === 'chapter' && 
                        selectedSection.chapterIndex === chapterIndex && 
                        selectedSection.subheadingIndex === subIndex
                          ? 'bg-primary-50 border-l-4 border-primary-500'
                          : ''
                      }`}
                    >
                      <Circle className="w-2 h-2 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-700">{subheading.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Quiz Section */}
          {content?.quiz && (
            <button
              onClick={() => selectContent('quiz')}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center ${
                selectedSection.type === 'quiz' ? 'bg-primary-50 border-l-4 border-primary-500' : ''
              }`}
            >
              <HelpCircle className="w-4 h-4 mr-2 text-purple-500" />
              <span className="text-sm font-medium">Take Quiz</span>
            </button>
          )}

          {/* Visualizations */}
          {content?.visualizations && content.visualizations.length > 0 && (
            <button
              onClick={() => selectContent('visualizations')}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center ${
                selectedSection.type === 'visualizations' ? 'bg-primary-50 border-l-4 border-primary-500' : ''
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm font-medium">Visualizations</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-500">
            {selectedSection.type === 'overview' && 'Overview'}
            {selectedSection.type === 'chapter' && content?.chapters && (
              <>
                {content.chapters[selectedSection.chapterIndex]?.title}
                {selectedSection.subheadingIndex !== null && (
                  <>
                    {' > '}
                    {content.chapters[selectedSection.chapterIndex]?.subheadings?.[selectedSection.subheadingIndex]?.title}
                  </>
                )}
              </>
            )}
            {selectedSection.type === 'quiz' && 'Quiz'}
            {selectedSection.type === 'visualizations' && 'Visualizations'}
          </div>

          {/* Content Display */}
          {currentContent?.isQuiz ? (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {content.quiz?.title || 'Test Your Knowledge'}
              </h1>
              {content.quiz?.description && (
                <p className="text-gray-600 mb-6">{content.quiz.description}</p>
              )}
              <QuizComponent 
                quiz={content.quiz} 
                onRetakeCourse={onRetakeCourse}
                originalPrompt={originalPrompt}
              />
            </div>
          ) : currentContent?.isVisualization ? (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Visualizations</h1>
              <VisualizationComponent visualizations={content.visualizations} />
            </div>
          ) : currentContent ? (
            <div>
              {currentContent.title && (
                <h1 className="text-3xl font-bold text-gray-800 mb-6">{currentContent.title}</h1>
              )}
              
              {/* Chapter summary */}
              {currentContent.summary && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-gray-700">{currentContent.summary}</p>
                </div>
              )}
              
              {/* Scenes (new format from agent) */}
              {currentContent.scenes && currentContent.scenes.length > 0 ? (
                <div className="space-y-4">
                  {currentContent.scenes.map((scene, index) => (
                    <SceneDisplay key={index} scene={scene} sceneIndex={index} />
                  ))}
                </div>
              ) : currentContent.content ? (
                /* Old format - regular content */
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{currentContent.content}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a topic from the sidebar to begin</p>
            </div>
          )}

          {/* Resources at bottom if on overview */}
          {selectedSection.type === 'overview' && content?.resources && content.resources.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-primary-500" />
                      <span className="text-sm font-medium text-gray-800">
                        {resource.title || resource}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;

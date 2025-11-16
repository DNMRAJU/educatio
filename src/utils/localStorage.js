// Local Storage utility for managing chat sessions and quiz results

const STORAGE_KEYS = {
  CHAT_SESSIONS: 'elearning_chat_sessions',
  CURRENT_SESSION: 'elearning_current_session',
  QUIZ_RESULTS: 'elearning_quiz_results'
};

// Chat Session Management
export const saveChatSession = (sessionId, sessionData) => {
  try {
    const sessions = getAllChatSessions();
    sessions[sessionId] = {
      ...sessionData,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
    return true;
  } catch (error) {
    console.error('Error saving chat session:', error);
    return false;
  }
};

export const getAllChatSessions = () => {
  try {
    const sessions = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    return sessions ? JSON.parse(sessions) : {};
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return {};
  }
};

export const getChatSession = (sessionId) => {
  try {
    const sessions = getAllChatSessions();
    return sessions[sessionId] || null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

export const deleteChatSession = (sessionId) => {
  try {
    const sessions = getAllChatSessions();
    delete sessions[sessionId];
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
    
    // Also delete associated quiz results
    deleteQuizResults(sessionId);
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
};

export const getCurrentSessionId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const setCurrentSessionId = (sessionId) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
    return true;
  } catch (error) {
    console.error('Error setting current session:', error);
    return false;
  }
};

export const createNewSession = (title = 'New Chat') => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sessionData = {
    id: sessionId,
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  saveChatSession(sessionId, sessionData);
  setCurrentSessionId(sessionId);
  
  return sessionData;
};

// Quiz Results Management
export const saveQuizResults = (sessionId, quizData) => {
  try {
    const allResults = getAllQuizResults();
    if (!allResults[sessionId]) {
      allResults[sessionId] = [];
    }
    
    allResults[sessionId].push({
      ...quizData,
      timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(allResults));
    return true;
  } catch (error) {
    console.error('Error saving quiz results:', error);
    return false;
  }
};

export const getAllQuizResults = () => {
  try {
    const results = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
    return results ? JSON.parse(results) : {};
  } catch (error) {
    console.error('Error getting quiz results:', error);
    return {};
  }
};

export const getQuizResults = (sessionId) => {
  try {
    const allResults = getAllQuizResults();
    return allResults[sessionId] || [];
  } catch (error) {
    console.error('Error getting quiz results for session:', error);
    return [];
  }
};

export const deleteQuizResults = (sessionId) => {
  try {
    const allResults = getAllQuizResults();
    delete allResults[sessionId];
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(allResults));
    return true;
  } catch (error) {
    console.error('Error deleting quiz results:', error);
    return false;
  }
};

// Get quiz summary for a session (passed/failed questions)
export const getQuizSummary = (sessionId) => {
  const results = getQuizResults(sessionId);
  if (results.length === 0) return null;
  
  const latestQuiz = results[results.length - 1];
  const passed = [];
  const failed = [];
  
  if (latestQuiz.questions && latestQuiz.answers) {
    latestQuiz.questions.forEach((question, index) => {
      const userAnswer = latestQuiz.answers[index];
      const isCorrect = latestQuiz.correctAnswers?.[index] === userAnswer;
      
      if (isCorrect) {
        passed.push({
          question: question.question || question.text,
          index: index + 1
        });
      } else {
        failed.push({
          question: question.question || question.text,
          index: index + 1,
          userAnswer: question.options?.[userAnswer] || userAnswer,
          correctAnswer: question.options?.[latestQuiz.correctAnswers?.[index]] || latestQuiz.correctAnswers?.[index]
        });
      }
    });
  }
  
  return {
    totalQuestions: latestQuiz.questions?.length || 0,
    score: latestQuiz.score || 0,
    passed,
    failed,
    timestamp: latestQuiz.timestamp
  };
};

// Utility to get session list sorted by last updated
export const getSortedSessions = () => {
  const sessions = getAllChatSessions();
  return Object.values(sessions).sort((a, b) => 
    new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
};

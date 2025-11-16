import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, TrendingUp, Lock, CreditCard } from 'lucide-react';
import { saveQuizResults, getQuizResults } from '../utils/localStorage';
import { sendQuizFeedback } from '../services/api';

const QuizComponent = ({ quiz, onRetakeCourse, sessionId, topic }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success', 'error', 'warning'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedResults, setSavedResults] = useState(null);

  const questions = quiz.questions || quiz;

  // Load saved quiz results on mount
  useEffect(() => {
    if (sessionId) {
      const results = getQuizResults(sessionId);
      if (results && results.length > 0) {
        // Get the latest quiz result
        const latestResult = results[results.length - 1];
        
        // Check if this quiz matches the saved one (same number of questions)
        if (latestResult.questions && latestResult.questions.length === questions.length) {
          // Load the saved state
          setSavedResults(latestResult);
          setAnswers(latestResult.answers || {});
          setScore(latestResult.score || 0);
          setShowResults(true);
          setIsSubmitted(true);
          console.log('Loaded saved quiz results from localStorage');
        }
      }
    }
  }, [sessionId, questions.length]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    // Prevent changing answers if quiz is already submitted
    if (showResults || isSubmitted) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    const correctAnswers = {};
    const feedbackResponses = [];
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      let correctIndex = null;
      let correctAnswerLetter = '';
      let userAnswerLetter = '';
      
      // Handle different answer formats
      if (question.answer) {
        // New format: answer is "A", "B", "C", "D"
        const answerLetter = question.answer.replace(/[^A-D]/g, ''); // Extract letter
        correctIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        isCorrect = userAnswer === correctIndex;
        correctAnswerLetter = answerLetter;
        userAnswerLetter = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : '';
      } else if (question.correctAnswer !== undefined) {
        // Old format: correctAnswer is numeric index
        correctIndex = question.correctAnswer;
        isCorrect = userAnswer === question.correctAnswer;
        correctAnswerLetter = String.fromCharCode(65 + correctIndex);
        userAnswerLetter = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : '';
      } else if (question.correct_answer !== undefined) {
        // Alternative old format
        correctIndex = question.correct_answer;
        isCorrect = userAnswer === question.correct_answer;
        correctAnswerLetter = String.fromCharCode(65 + correctIndex);
        userAnswerLetter = userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : '';
      }
      
      correctAnswers[index] = correctIndex;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Build feedback response for Airia
      const questionOptions = question.options || question.choices || [];
      const optionsObject = {};
      questionOptions.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C, D
        optionsObject[letter] = typeof opt === 'string' ? opt : opt.text;
      });
      
      feedbackResponses.push({
        topic: question.topic || topic || 'General',
        question: question.question || question.text,
        options: optionsObject,
        correct_answer: correctAnswerLetter,
        user_response: userAnswerLetter
      });
    });

    setScore(correctCount);
    setShowResults(true);
    setIsSubmitted(true);
    
    // Save quiz results to local storage
    if (sessionId) {
      const quizData = {
        questions,
        answers,
        correctAnswers,
        score: correctCount,
        totalQuestions: questions.length
      };
      saveQuizResults(sessionId, quizData);
      setSavedResults(quizData);
      console.log('Quiz results saved to localStorage');
    }
    
    // Send feedback to Airia
    try {
      await sendQuizFeedback(
        `Topics: ${topic || 'Quiz Results'}`,
        feedbackResponses
      );
      setFeedbackSent(true);
      setToastType('success');
      setToastMessage('Feedback saved successfully!');
      setShowToast(true);
      console.log('Quiz feedback sent to Airia successfully');
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to send quiz feedback:', error);
      
      // Check for specific error types
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      if (status === 402 || errorData?.httpStatusCode === 'PaymentRequired') {
        // Insufficient credits error
        setToastType('error');
        setToastMessage('⚠️ Insufficient credits. Quiz saved locally but feedback not sent.');
        console.log('Insufficient credits error:', errorData?.validationResult?.errorMessage);
      } else if (status === 401 || status === 403) {
        // Authentication/Authorization error
        setToastType('error');
        setToastMessage('Authentication error. Quiz saved locally.');
      } else if (status >= 500) {
        // Server error
        setToastType('warning');
        setToastMessage('Server error. Quiz saved locally, will retry later.');
      } else {
        // Generic error
        setToastType('warning');
        setToastMessage('Could not send feedback. Quiz saved locally.');
      }
      
      setShowToast(true);
      
      // Hide toast after 5 seconds for errors (longer than success)
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
      // Don't block the UI if feedback fails - quiz is still saved locally
    }
  };


  const isCorrectAnswer = (questionIndex, optionIndex) => {
    const question = questions[questionIndex];
    
    // Handle different answer formats
    if (question.answer) {
      // New format: answer is "A", "B", "C", "D"
      const answerLetter = question.answer.replace(/[^A-D]/g, ''); // Extract letter
      const correctIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      return optionIndex === correctIndex;
    } else if (question.correctAnswer !== undefined) {
      // Old format: correctAnswer is numeric index
      return optionIndex === question.correctAnswer;
    } else if (question.correct_answer !== undefined) {
      // Alternative old format
      return optionIndex === question.correct_answer;
    }
    
    return false;
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="px-4 py-3 text-gray-500">
        No quiz questions available.
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Quiz Submitted Notice */}
      {isSubmitted && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Quiz Already Completed</h4>
              <p className="text-sm text-blue-700">
                You've already submitted this quiz. Your results have been saved and cannot be changed. 
                Use the "Continue Learning" button below to get personalized help based on your performance.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                Question {questionIndex + 1}
              </span>
              <h4 className="mt-1 font-semibold text-gray-800">
                {question.question || question.text}
              </h4>
            </div>

            <div className="space-y-2">
              {(question.options || question.choices || []).map((option, optionIndex) => {
                const isSelected = answers[questionIndex] === optionIndex;
                const isCorrect = isCorrectAnswer(questionIndex, optionIndex);
                const userAnsweredWrong = showResults && isSelected && !isCorrect;
                const showAsCorrect = showResults && isCorrect;

                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(questionIndex, optionIndex)}
                    disabled={showResults || isSubmitted}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isSelected && !showResults
                        ? 'border-cyan-400 bg-cyan-50'
                        : showAsCorrect
                        ? 'border-green-500 bg-green-50'
                        : userAnsweredWrong
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    } ${showResults || isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        showAsCorrect ? 'text-green-700 font-semibold' : 'text-gray-700'
                      }`}>
                        {typeof option === 'string' ? option : option.text}
                      </span>
                      {showResults && (
                        showAsCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : userAnsweredWrong ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : null
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResults && (question.explanation || question.rationale) && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">{question.explanation || question.rationale}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiz Actions */}
      <div className="mt-6">
        {/* Toast Notification */}
        {showToast && (
          <div className={`mb-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 fade-in ${
            toastType === 'success' ? 'bg-green-500 text-white' :
            toastType === 'error' ? 'bg-red-500 text-white' :
            'bg-orange-500 text-white'
          }`}>
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : toastType === 'error' ? (
              <CreditCard className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        )}
        
        {!showResults && !isSubmitted ? (
          <div className="flex items-center justify-between">
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length !== questions.length}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-semibold"
            >
              Submit Quiz
            </button>
            <span className="text-sm text-gray-500">
              {Object.keys(answers).length}/{questions.length} answered
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score Display */}
            <div className="p-6 bg-cyan-50 rounded-xl border border-cyan-200 shadow-sm">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-4">
                  <span className="text-3xl font-bold text-cyan-600">{score}</span>
                  <span className="text-lg text-gray-400">/{questions.length}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {score === questions.length ? (
                    <span className="text-green-600">Perfect Score! 🎉</span>
                  ) : score >= questions.length * 0.7 ? (
                    <span className="text-cyan-600">Great Job! 👏</span>
                  ) : (
                    <span className="text-orange-600">Keep Learning! 📚</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  You got {score} out of {questions.length} questions correct
                  {score < questions.length && (
                    <span className="block mt-1">({Math.round((score / questions.length) * 100)}% accuracy)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Continue Learning Message */}
            <div className="p-5 bg-green-50 border border-green-200 rounded-xl shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-600 rounded-lg shadow-sm">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-800 mb-2">
                    Ready to Continue Learning?
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {score === questions.length ? (
                      "Excellent work! Your quiz results have been saved. Use the 'Continue Learning' button below to explore advanced topics."
                    ) : (
                      `Your quiz results have been saved. Use the 'Continue Learning' button below to get personalized help on the ${questions.length - score} question${questions.length - score !== 1 ? 's' : ''} you missed.`
                    )}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {feedbackSent 
                        ? 'Quiz results saved & feedback sent to AI • Continue learning anytime'
                        : 'Quiz results saved • Continue learning anytime'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;

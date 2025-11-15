import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const QuizComponent = ({ quiz }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = quiz.questions || quiz;

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    if (showResults) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      
      // Handle different answer formats
      if (question.answer) {
        // New format: answer is "A", "B", "C", "D"
        const answerLetter = question.answer.replace(/[^A-D]/g, ''); // Extract letter
        const correctIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        isCorrect = userAnswer === correctIndex;
      } else if (question.correctAnswer !== undefined) {
        // Old format: correctAnswer is numeric index
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.correct_answer !== undefined) {
        // Alternative old format
        isCorrect = userAnswer === question.correct_answer;
      }
      
      if (isCorrect) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setShowResults(true);
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
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
      <div className="space-y-6">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                Question {questionIndex + 1}
              </span>
              <h4 className="mt-1 font-medium text-gray-800">
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
                    disabled={showResults}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isSelected && !showResults
                        ? 'border-purple-500 bg-purple-50'
                        : showAsCorrect
                        ? 'border-green-500 bg-green-50'
                        : userAnsweredWrong
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    } ${showResults ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        showAsCorrect ? 'text-green-700 font-medium' : 'text-gray-700'
                      }`}>
                        {typeof option === 'string' ? option : option.text}
                      </span>
                      {showResults && (
                        showAsCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
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
      <div className="mt-6 flex items-center justify-between">
        {!showResults ? (
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(answers).length !== questions.length}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="text-lg font-medium">
              Score: <span className="text-purple-600">{score}/{questions.length}</span>
              {score === questions.length && (
                <span className="ml-2 text-green-600">Perfect! 🎉</span>
              )}
            </div>
            <button
              onClick={handleResetQuiz}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {!showResults && (
          <span className="text-sm text-gray-500">
            {Object.keys(answers).length}/{questions.length} answered
          </span>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;

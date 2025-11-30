import React, { useState, useEffect } from "react";
import "./StudentDashboard.css";
import "../App.css";
import studentBg from "../assets/student.jpg";
import { useNavigate } from "react-router-dom";
const gradeToNumber = (grade) => {
  if (!grade) return 0;
  grade = grade.toString().toUpperCase();

  if (grade === "A") return 90;
  if (grade === "B") return 80;
  if (grade === "C") return 70;
  if (grade === "D") return 60;
  if (grade === "SS") return 95; // ✅ your case
  if (!isNaN(grade)) return Number(grade);

  return 0;
};


// Enhanced Components
const ProgressChart = ({ submissions, quizzes }) => {
  const completedAssignments = submissions.filter(sub => sub.grade).length;
  const totalAssignments = submissions.length;
  const completedQuizzes = quizzes.length;
  const progressPercentage = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

  return (
    <div className="progress-chart">
      <h4>📊 Learning Progress</h4>
      <div className="chart-container">
        <div className="progress-circle">
          <div 
            className="progress-fill"
            style={{ 
              background: `conic-gradient(#3498db ${progressPercentage}%, #ecf0f1 0)` 
            }}
          >
            <div className="progress-inner">
              <span className="progress-text">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
        <div className="progress-stats">
          <div className="progress-stat">
            <span className="stat-value">{completedAssignments}</span>
            <span className="stat-label">Graded Assignments</span>
          </div>
          <div className="progress-stat">
            <span className="stat-value">{submissions.length}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
          <div className="progress-stat">
            <span className="stat-value">{completedQuizzes}</span>
            <span className="stat-label">Quiz Attempts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceMetrics = ({ submissions, quizAttempts }) => {
  const averageGrade =
  submissions.filter(sub => sub.grade).length > 0
    ? submissions
        .filter(sub => sub.grade)
        .reduce((acc, sub) => acc + gradeToNumber(sub.grade), 0) /
      submissions.filter(sub => sub.grade).length
    : 0;


  const quizSuccessRate = quizAttempts.length > 0
    ? (quizAttempts.filter(attempt => attempt.passed).length / quizAttempts.length) * 100
    : 0;

  return (
    <div className="metrics-panel">
      <h3>⭐ Performance Metrics</h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{averageGrade.toFixed(1)}</div>
          <div className="metric-label">Average Grade</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{quizSuccessRate.toFixed(1)}%</div>
          <div className="metric-label">Quiz Success Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{submissions.filter(sub => sub.grade).length}</div>
          <div className="metric-label">Graded Work</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{quizAttempts.length}</div>
          <div className="metric-label">Quizzes Completed</div>
        </div>
      </div>
    </div>
  );
};

const StudentNotifications = ({ notifications, onClearNotification }) => {
  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>🔔 Notifications</h3>
        <span className="notification-count">{notifications.length}</span>
      </div>
      <div className="notifications-list">
        {notifications.slice(0, 5).map((notification, index) => (
          <div key={index} className={`notification-item ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'assignment' ? '📝' : 
                 notification.type === 'quiz' ? '🎯' : 
                 notification.type === 'grade' ? '📊' : 'ℹ️'}
              </span>
              <span className="notification-text">{notification.message}</span>
            </div>
            <button 
              className="notification-clear"
              onClick={() => onClearNotification(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Quiz Attempt Modal
const QuizAttemptModal = ({ quiz, onClose, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setVisitedQuestions(prev => new Set([...prev, nextIndex]));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
        score += question.points;
      }
    });

    onSubmit(score, answers);
    onClose();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isAnswered = (questionId) => {
    return answers[questionId] && answers[questionId].trim() !== '';
  };

  return (
    <div className="quiz-modal modal-overlay">
      <div className="quiz-modal-content enhanced-modal">
        <div className="quiz-header modal-header">
          <div className="quiz-title">
            <h2>{quiz.title}</h2>
            <div className="quiz-info">
              <span>Questions: {quiz.questions.length}</span>
              <span>Total Points: {quiz.totalPoints}</span>
            </div>
          </div>
          <div className="quiz-timer">
            ⏰ {formatTime(timeLeft)}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="quiz-progress">
          <div className="progress-info">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
            <span className="progress-percentage">
              ({Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%)
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="question-container">
          <div className="question-header">
            <h3>Q{currentQuestionIndex + 1}: {currentQuestion.question}</h3>
            <div className="question-points">{currentQuestion.points} points</div>
          </div>
          
          <div className="question-type">
            Type: {currentQuestion.type.replace('-', ' ').toUpperCase()}
          </div>

          <div className="options-container">
            {currentQuestion.type === "multiple-choice" && (
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="option-card">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(option)}
                      className="option-input"
                    />
                    <div className="option-content">
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "true-false" && (
              <div className="true-false-options">
                <label className="option-card">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="true"
                    checked={answers[currentQuestion.id] === "true"}
                    onChange={() => handleAnswerChange("true")}
                    className="option-input"
                  />
                  <div className="option-content">
                    <span className="option-text">True</span>
                  </div>
                </label>
                <label className="option-card">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="false"
                    checked={answers[currentQuestion.id] === "false"}
                    onChange={() => handleAnswerChange("false")}
                    className="option-input"
                  />
                  <div className="option-content">
                    <span className="option-text">False</span>
                  </div>
                </label>
              </div>
            )}

            {currentQuestion.type === "short-answer" && (
              <div className="short-answer-container">
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  rows="4"
                  className="short-answer-input"
                />
                <div className="answer-length">
                  {answers[currentQuestion.id]?.length || 0} characters
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="quiz-navigation">
          <div className="nav-section">
            <button 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="nav-btn prev-btn"
            >
              ← Previous
            </button>
          </div>
          
          <div className="question-numbers">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuestionSelect(index)}
                className={`question-number ${
                  currentQuestionIndex === index ? 'active' : ''
                } ${
                  isAnswered(quiz.questions[index].id) ? 'answered' : ''
                } ${
                  visitedQuestions.has(index) ? 'visited' : ''
                }`}
                title={`Question ${index + 1}`}
              >
                {index + 1}
                {isAnswered(quiz.questions[index].id) && <span className="answer-dot">•</span>}
              </button>
            ))}
          </div>

          <div className="nav-section">
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button onClick={handleSubmit} className="nav-btn submit-btn">
                🚀 Submit Quiz
              </button>
            ) : (
              <button onClick={handleNext} className="nav-btn next-btn">
                Next →
              </button>
            )}
          </div>
        </div>

        <div className="quiz-footer">
          <div className="answered-count">
            Answered: {Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length} / {quiz.questions.length}
          </div>
          <div className="time-warning">
            {timeLeft < 300 && '⏳ Time is running out!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  
  // Available assignments (from mentor)
  const [availableAssignments, setAvailableAssignments] = useState([]);
  // Available quizzes (from mentor)
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  
  // Student submission
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myQuizAttempts, setMyQuizAttempts] = useState([]);

  const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user"));

const userName =
  user?.name && isNaN(user.name)
    ? user.name
    : user?.email?.split("@")[0] || "Student";

const userID = user?._id || "N/A";

  // Enhanced data loading with notifications
  useEffect(() => {
    // Load assignments uploaded by mentor
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    setAvailableAssignments(assignments);
    
    // Load quizzes uploaded by mentor
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    setAvailableQuizzes(quizzes);
    
    // Load student's previous submissions
    const submissions = JSON.parse(localStorage.getItem("studentSubmissions")) || [];
    const mySubs = submissions.filter(sub => sub.studentId === userID);
    setMySubmissions(mySubs);

    // Load student's quiz attempts
    const quizSubmissions = JSON.parse(localStorage.getItem("quizSubmissions")) || [];
    const myQuizSubs = quizSubmissions.filter(sub => sub.studentId === userID);
    setMyQuizAttempts(myQuizSubs);

    // Generate notifications
    const newNotifications = [];
    
    // New assignments notification
    const recentAssignments = assignments.filter(assignment => 
      new Date(assignment.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (recentAssignments.length > 0) {
      newNotifications.push({
        type: 'assignment',
        message: `${recentAssignments.length} new assignment${recentAssignments.length > 1 ? 's' : ''} available`
      });
    }

    // New quizzes notification
    const recentQuizzes = quizzes.filter(quiz => 
      new Date(quiz.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (recentQuizzes.length > 0) {
      newNotifications.push({
        type: 'quiz',
        message: `${recentQuizzes.length} new quiz${recentQuizzes.length > 1 ? 'zes' : ''} available`
      });
    }

    // New grades notification
    const newGrades = mySubs.filter(sub => 
      sub.grade && new Date(sub.gradedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (newGrades.length > 0) {
      newNotifications.push({
        type: 'grade',
        message: `${newGrades.length} new grade${newGrades.length > 1 ? 's' : ''} received`
      });
    }

    // Upcoming deadlines
    const upcomingDeadlines = [...assignments, ...quizzes].filter(item => {
      const deadline = new Date(item.deadline);
      const now = new Date();
      const timeDiff = deadline.getTime() - now.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      return daysDiff > 0 && daysDiff <= 2; // Within 2 days
    });
    
    if (upcomingDeadlines.length > 0) {
      newNotifications.push({
        type: 'info',
        message: `${upcomingDeadlines.length} deadline${upcomingDeadlines.length > 1 ? 's' : ''} approaching`
      });
    }

    setNotifications(newNotifications);
  }, [userID]);

  // Enhanced search and filter functionality
  const filteredAssignments = availableAssignments.filter(assignment =>
    assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuizzes = availableQuizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubmissions = mySubmissions.filter(submission =>
    submission.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.setItem('studentLastLogin', new Date().toISOString());
    navigate("/");
  };

  const handleFileChange = (e) => setSubmissionFile(e.target.files[0]);

  // Check if student has already submitted an assignment
  const hasSubmittedAssignment = (assignmentId) => {
    return mySubmissions.some(sub => sub.assignmentId === assignmentId);
  };

  // Check if student has attempted a quiz
  const hasAttemptedQuiz = (quizId) => {
    return myQuizAttempts.some(attempt => attempt.quizId === quizId);
  };

  // Get student's submission for a specific assignment
  const getStudentSubmission = (assignmentId) => {
    return mySubmissions.find(sub => sub.assignmentId === assignmentId);
  };

  // Get student's attempt for a specific quiz
  const getQuizAttempt = (quizId) => {
    return myQuizAttempts.find(attempt => attempt.quizId === quizId);
  };

  // Enhanced assignment submission with validation
  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionFile) {
      alert("Please select an assignment and upload a file.");
      return;
    }

    // Check file size (max 10MB)
    if (submissionFile.size > 10 * 1024 * 1024) {
      alert("File size too large. Please upload a file smaller than 10MB.");
      return;
    }

    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.jpg', '.png'];
    const fileExtension = submissionFile.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes('.' + fileExtension)) {
      alert("Please upload a valid file type (PDF, DOC, DOCX, TXT, ZIP, JPG, PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const existingSubmission = getStudentSubmission(selectedAssignment.id);
      const isResubmission = !!existingSubmission;

      const newSubmission = {
        id: isResubmission ? existingSubmission.id : Date.now().toString(),
        studentId: userID,
        studentName: userName,
        assignmentId: selectedAssignment.id,
        assignmentName: selectedAssignment.assignmentName,
        fileName: submissionFile.name,
        fileData: reader.result,
        fileSize: (submissionFile.size / 1024 / 1024).toFixed(2) + " MB",
        fileType: fileExtension,
        submittedAt: new Date().toISOString(),
        status: isResubmission ? "Resubmitted" : "Submitted",
        grade: "",
        feedback: "",
        gradedAt: "",
        resubmissionCount: isResubmission ? (existingSubmission.resubmissionCount || 0) + 1 : 0,
        previousSubmissionDate: isResubmission ? existingSubmission.submittedAt : null
      };

      // Update local state
      if (isResubmission) {
        setMySubmissions(prev => 
          prev.map(sub => 
            sub.id === existingSubmission.id ? newSubmission : sub
          )
        );
      } else {
        setMySubmissions(prev => [...prev, newSubmission]);
      }

      // Save to localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem("studentSubmissions")) || [];
      
      if (isResubmission) {
        const updatedSubmissions = existingSubmissions.map(sub =>
          sub.id === existingSubmission.id ? newSubmission : sub
        );
        localStorage.setItem("studentSubmissions", JSON.stringify(updatedSubmissions));
      } else {
        existingSubmissions.push(newSubmission);
        localStorage.setItem("studentSubmissions", JSON.stringify(existingSubmissions));
      }

      // Add notification
      setNotifications(prev => [{
        type: 'info',
        message: `Assignment "${selectedAssignment.assignmentName}" ${isResubmission ? 'resubmitted' : 'submitted'} successfully`
      }, ...prev]);

      // Reset form
      setSelectedAssignment(null);
      setSubmissionFile(null);
    };

    reader.readAsDataURL(submissionFile);
  };

  // Enhanced quiz submission
  const handleQuizSubmit = (score, answers) => {
    const newAttempt = {
      id: Date.now().toString(),
      studentId: userID,
      studentName: userName,
      quizId: selectedQuiz.id,
      quizTitle: selectedQuiz.title,
      score: score,
      totalPoints: selectedQuiz.totalPoints,
      answers: answers,
      submittedAt: new Date().toISOString(),
      percentage: (score / selectedQuiz.totalPoints) * 100,
      passed: (score / selectedQuiz.totalPoints) * 100 >= selectedQuiz.passingScore,
      timeTaken: 60 * 60 - timeLeft // Calculate time taken
    };

    // Update local state
    setMyQuizAttempts(prev => [...prev, newAttempt]);

    // Save to localStorage
    const existingAttempts = JSON.parse(localStorage.getItem("quizSubmissions")) || [];
    existingAttempts.push(newAttempt);
    localStorage.setItem("quizSubmissions", JSON.stringify(existingAttempts));

    // Add notification
    setNotifications(prev => [{
      type: 'info',
      message: `Quiz "${selectedQuiz.title}" completed - Score: ${score}/${selectedQuiz.totalPoints}`
    }, ...prev]);
  };

  // Enhanced download function
  const handleDownloadAssignment = (assignment) => {
    if (assignment.fileData) {
      const link = document.createElement('a');
      link.href = assignment.fileData;
      link.download = assignment.fileName || 'assignment.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Enhanced grade viewing
  const handleViewGrade = (submission) => {
    if (submission.grade) {
      const modalContent = `
        <div class="grade-details-modal">
          <h3>📊 Grade Details</h3>
          <div class="grade-info">
            <p><strong>Assignment:</strong> ${submission.assignmentName}</p>
            <p><strong>Grade:</strong> <span class="grade-value">${submission.grade}</span></p>
            <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
            <p><strong>Graded on:</strong> ${new Date(submission.gradedAt).toLocaleString()}</p>
            ${submission.feedback ? `<p><strong>Feedback:</strong> ${submission.feedback}</p>` : ''}
            ${submission.resubmissionCount > 0 ? `<p><strong>Attempts:</strong> ${submission.resubmissionCount + 1}</p>` : ''}
          </div>
        </div>
      `;
      
      // You could replace this with a proper modal component
      alert(`Grade: ${submission.grade}\nFeedback: ${submission.feedback || "No feedback provided"}`);
    } else {
      alert("This assignment hasn't been graded yet.");
    }
  };

  const handleClearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Enhanced dashboard statistics
  const dashboardStats = {
    totalAssignments: availableAssignments.length + availableQuizzes.length,
    totalSubmissions: mySubmissions.length + myQuizAttempts.length,
    gradedWork: mySubmissions.filter(sub => sub.grade).length + myQuizAttempts.length,
    pendingAssignments: availableAssignments.length - mySubmissions.length,
    averageGrade: mySubmissions.filter(sub => sub.grade).length > 0 
      ? (mySubmissions.filter(sub => sub.grade)
          .reduce((acc, sub) => acc + (parseFloat(sub.grade) || 0), 0) / 
         mySubmissions.filter(sub => sub.grade).length).toFixed(1)
      : 0
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "assignments":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>📚 Available Assignments</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="assignments-overview">
              <div className="overview-stats">
                <div className="overview-stat total">
                  <span className="stat-count">{availableAssignments.length}</span>
                  <span className="stat-label">Total Assignments</span>
                </div>
                <div className="overview-stat submitted">
                  <span className="stat-count">{mySubmissions.length}</span>
                  <span className="stat-label">Submitted</span>
                </div>
                <div className="overview-stat pending">
                  <span className="stat-count">{availableAssignments.length - mySubmissions.length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="overview-stat graded">
                  <span className="stat-count">{mySubmissions.filter(sub => sub.grade).length}</span>
                  <span className="stat-label">Graded</span>
                </div>
              </div>
            </div>

            <div className="assignments-grid enhanced-grid">
              {filteredAssignments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No assignments found</h3>
                  <p>{searchTerm ? "Try adjusting your search terms" : "No assignments available yet"}</p>
                </div>
              ) : (
                filteredAssignments.map((assignment) => {
                  const hasSubmitted = hasSubmittedAssignment(assignment.id);
                  const submission = getStudentSubmission(assignment.id);
                  const isOverdue = new Date(assignment.deadline) < new Date();
                  
                  return (
                    <div key={assignment.id} className="assignment-card enhanced-card">
                      <div className="assignment-header">
                        <div className="assignment-icon">
                          {assignment.type === "quiz" ? "🎯" : "📝"}
                        </div>
                        <div className="assignment-title">
                          <h4>{assignment.assignmentName}</h4>
                          <div className="assignment-type">{assignment.type === "quiz" ? "Quiz" : "Assignment"}</div>
                        </div>
                        <div className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}>
                          {isOverdue ? '⚠️ ' : '📅 '}
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="assignment-details">
                        <div className="detail-row">
                          <span className="detail-label">Due Date:</span>
                          <span className="detail-value">{new Date(assignment.deadline).toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Uploaded:</span>
                          <span className="detail-value">{new Date(assignment.createdAt).toLocaleDateString()}</span>
                        </div>
                        {assignment.fileSize && (
                          <div className="detail-row">
                            <span className="detail-label">File Size:</span>
                            <span className="detail-value">{assignment.fileSize}</span>
                          </div>
                        )}
                      </div>

                      <div className="submission-status">
                        {hasSubmitted ? (
                          <div className="status-info">
                            <div className="status-badge submitted">
                              {submission.status}
                              {submission.resubmissionCount > 0 && ` (${submission.resubmissionCount + 1} attempts)`}
                            </div>
                            <div className="submission-date">
                              Last submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </div>
                            {submission.grade && (
                              <div className="grade-preview">
                                Grade: <span className="grade-value">{submission.grade}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="status-info">
                            <div className="status-badge pending">Not Submitted</div>
                            {isOverdue && (
                              <div className="overdue-warning">This assignment is overdue</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="assignment-actions">
                        <button 
                          onClick={() => handleDownloadAssignment(assignment)}
                          className="btn-secondary"
                        >
                          📥 Download
                        </button>
                        <button 
                          onClick={() => setSelectedAssignment(assignment)}
                          className={hasSubmitted ? "btn-warning" : "btn-primary"}
                        >
                          {hasSubmitted ? "🔄 Resubmit" : "📝 Submit"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Enhanced Submission Modal */}
            {selectedAssignment && (
              <div className="submission-modal modal-overlay">
                <div className="modal-content enhanced-modal">
                  <div className="modal-header">
                    <h3>
                      {hasSubmittedAssignment(selectedAssignment.id) ? '🔄 Resubmit' : '📝 Submit'} Assignment
                    </h3>
                    <button 
                      onClick={() => setSelectedAssignment(null)}
                      className="modal-close"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="assignment-details-card">
                    <h4>{selectedAssignment.assignmentName}</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Due Date:</span>
                        <span className="detail-value">{new Date(selectedAssignment.deadline).toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{selectedAssignment.type === "quiz" ? "Quiz" : "Regular Assignment"}</span>
                      </div>
                      {selectedAssignment.fileSize && (
                        <div className="detail-item">
                          <span className="detail-label">File Size:</span>
                          <span className="detail-value">{selectedAssignment.fileSize}</span>
                        </div>
                      )}
                    </div>
                    
                    {hasSubmittedAssignment(selectedAssignment.id) && (
                      <div className="resubmission-notice">
                        <div className="notice-icon">⚠️</div>
                        <div className="notice-content">
                          <strong>Resubmission Notice</strong>
                          <p>You are about to resubmit this assignment. Your previous submission will be replaced.</p>
                          <div className="previous-submission">
                            Previous submission: {new Date(getStudentSubmission(selectedAssignment.id).submittedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmitAssignment} className="submission-form">
                    <div className="form-group">
                      <label>Upload Your Submission *</label>
                      <div className="file-upload-area">
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          className="file-input"
                          required
                          accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
                        />
                        <div className="file-upload-label">
                          {submissionFile ? `Selected: ${submissionFile.name}` : "Choose file or drag and drop (Max 10MB)"}
                        </div>
                      </div>
                      {submissionFile && (
                        <div className="file-info">
                          📎 {submissionFile.name} ({(submissionFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                      <div className="file-requirements">
                        <small>Accepted formats: PDF, DOC, DOCX, TXT, ZIP, JPG, PNG (Max 10MB)</small>
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        type="submit" 
                        className={hasSubmittedAssignment(selectedAssignment.id) ? "btn-warning" : "btn-primary"}
                      >
                        {hasSubmittedAssignment(selectedAssignment.id) ? '🔄 Resubmit Assignment' : '🚀 Submit Assignment'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSelectedAssignment(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "quizzes":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>🎯 Available Quizzes</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="quizzes-overview">
              <div className="overview-stats">
                <div className="overview-stat total">
                  <span className="stat-count">{availableQuizzes.length}</span>
                  <span className="stat-label">Total Quizzes</span>
                </div>
                <div className="overview-stat attempted">
                  <span className="stat-count">{myQuizAttempts.length}</span>
                  <span className="stat-label">Attempted</span>
                </div>
                <div className="overview-stat pending">
                  <span className="stat-count">{availableQuizzes.length - myQuizAttempts.length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="overview-stat passed">
                  <span className="stat-count">{myQuizAttempts.filter(attempt => attempt.passed).length}</span>
                  <span className="stat-label">Passed</span>
                </div>
              </div>
            </div>

            <div className="quizzes-grid enhanced-grid">
              {filteredQuizzes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h3>No quizzes found</h3>
                  <p>{searchTerm ? "Try adjusting your search terms" : "No quizzes available yet"}</p>
                </div>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const hasAttempted = hasAttemptedQuiz(quiz.id);
                  const attempt = getQuizAttempt(quiz.id);
                  const isOverdue = new Date(quiz.deadline) < new Date();
                  const percentage = attempt ? (attempt.score / quiz.totalPoints) * 100 : 0;
                  const passed = attempt ? percentage >= quiz.passingScore : false;
                  
                  return (
                    <div key={quiz.id} className="quiz-card enhanced-card">
                      <div className="quiz-header">
                        <div className="quiz-icon">🎯</div>
                        <div className="quiz-title">
                          <h4>{quiz.title}</h4>
                          <div className="quiz-meta">
                            <span>{quiz.questions.length} questions</span>
                            <span>{quiz.totalPoints} points</span>
                            <span>Passing: {quiz.passingScore}%</span>
                          </div>
                        </div>
                        <div className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}>
                          {isOverdue ? '⚠️ ' : '📅 '}
                          {new Date(quiz.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="quiz-details">
                        <div className="detail-row">
                          <span className="detail-label">Due Date:</span>
                          <span className="detail-value">{new Date(quiz.deadline).toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time Limit:</span>
                          <span className="detail-value">{quiz.timeLimit || 60} minutes</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Questions:</span>
                          <span className="detail-value">{quiz.questions.length} ({quiz.totalPoints} points)</span>
                        </div>
                      </div>

                      <div className="quiz-status">
                        {hasAttempted ? (
                          <div className="attempt-result">
                            <div className="result-header">
                              <div className={`result-badge ${passed ? 'pass' : 'fail'}`}>
                                {passed ? '✅ PASS' : '❌ FAIL'}
                              </div>
                              <div className="score-display">
                                Score: {attempt.score}/{quiz.totalPoints} ({percentage.toFixed(1)}%)
                              </div>
                            </div>
                            <div className="attempt-date">
                              Attempted: {new Date(attempt.submittedAt).toLocaleString()}
                            </div>
                            {!passed && (
                              <div className="retry-notice">
                                You can retry this quiz to improve your score
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="attempt-status">
                            <div className="status-badge pending">Not Attempted</div>
                            {isOverdue && (
                              <div className="overdue-warning">This quiz is no longer available</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="quiz-actions">
                        {!hasAttempted && !isOverdue ? (
                          <button 
                            onClick={() => setSelectedQuiz(quiz)}
                            className="btn-primary"
                          >
                            🎯 Start Quiz
                          </button>
                        ) : hasAttempted && !isOverdue ? (
                          <button 
                            onClick={() => setSelectedQuiz(quiz)}
                            className="btn-secondary"
                          >
                            🔄 Retry Quiz
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="btn-disabled"
                          >
                            ⌛ Expired
                          </button>
                        )}
                        {hasAttempted && (
                          <button 
                            onClick={() => {
                              // Show quiz results
                              alert(`Quiz: ${quiz.title}\nScore: ${attempt.score}/${quiz.totalPoints} (${percentage.toFixed(1)}%)\nResult: ${passed ? 'PASS' : 'FAIL'}`);
                            }}
                            className="btn-secondary"
                          >
                            📊 View Results
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Enhanced Quiz Attempt Modal */}
            {selectedQuiz && (
              <QuizAttemptModal 
                quiz={selectedQuiz}
                onClose={() => setSelectedQuiz(null)}
                onSubmit={handleQuizSubmit}
              />
            )}
          </div>
        );

      case "submissions":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>📝 My Submissions</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="submissions-overview">
              <div className="overview-stats">
                <div className="overview-stat total">
                  <span className="stat-count">{mySubmissions.length}</span>
                  <span className="stat-label">Total Submissions</span>
                </div>
                <div className="overview-stat graded">
                  <span className="stat-count">{mySubmissions.filter(sub => sub.grade).length}</span>
                  <span className="stat-label">Graded</span>
                </div>
                <div className="overview-stat pending">
                  <span className="stat-count">{mySubmissions.filter(sub => !sub.grade).length}</span>
                  <span className="stat-label">Pending Review</span>
                </div>
                <div className="overview-stat resubmitted">
                  <span className="stat-count">{mySubmissions.filter(sub => sub.resubmissionCount > 0).length}</span>
                  <span className="stat-label">Resubmissions</span>
                </div>
              </div>
            </div>

            <div className="submissions-list enhanced-list">
              {filteredSubmissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No submissions found</h3>
                  <p>{searchTerm ? "Try adjusting your search terms" : "You haven't submitted any assignments yet"}</p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="submission-card enhanced-card">
                    <div className="submission-main">
                      <div className="submission-icon">
                        {submission.assignmentName.includes('Quiz') ? '🎯' : '📝'}
                      </div>
                      <div className="submission-info">
                        <h4>{submission.assignmentName}</h4>
                        <div className="submission-meta">
                          <span className="submission-date">
                            📅 {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                          {submission.resubmissionCount > 0 && (
                            <span className="resubmission-badge">
                              🔄 {submission.resubmissionCount + 1} attempts
                            </span>
                          )}
                          {submission.fileSize && (
                            <span className="file-size">
                              💾 {submission.fileSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="submission-status">
                      <span className={`status-badge ${submission.status?.toLowerCase() || 'submitted'}`}>
                        {submission.grade ? 'Graded' : submission.status || "Submitted"}
                      </span>
                      {submission.grade && (
                        <div className="grade-display">
                          <strong>Grade: {submission.grade}</strong>
                        </div>
                      )}
                    </div>

                    <div className="submission-actions">
                      {submission.grade ? (
                        <button 
                          onClick={() => handleViewGrade(submission)}
                          className="btn-primary"
                        >
                          📊 View Grade
                        </button>
                      ) : (
                        <div className="pending-actions">
                          <span className="pending-text">Awaiting Grade</span>
                          <button 
                            onClick={() => {
                              const assignment = availableAssignments.find(a => a.id === submission.assignmentId);
                              if (assignment) setSelectedAssignment(assignment);
                            }}
                            className="btn-secondary btn-sm"
                          >
                            🔄 Resubmit
                          </button>
                        </div>
                      )}
                      <button 
                        onClick={() => handleDownloadAssignment(submission)}
                        className="btn-secondary"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "grades":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>📈 My Grades & Performance</h2>
              <PerformanceMetrics 
                submissions={mySubmissions}
                quizAttempts={myQuizAttempts}
              />
            </div>

            <div className="grades-content">
              <div className="grades-section">
                <h3>📝 Assignment Grades</h3>
                <div className="grades-grid enhanced-grid">
                  {mySubmissions
                    .filter(sub => sub.grade)
                    .map((submission) => (
                      <div key={submission.id} className="grade-card enhanced-card">
                        <div className="grade-header">
                          <h4>{submission.assignmentName}</h4>
                          <span className="grade-badge">{submission.grade}</span>
                        </div>
                        <div className="grade-details">
                          <div className="detail">
                            <span className="detail-label">Submitted:</span>
                            <span className="detail-value">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="detail">
                            <span className="detail-label">Graded:</span>
                            <span className="detail-value">
                              {new Date(submission.gradedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="detail">
                            <span className="detail-label">Attempts:</span>
                            <span className="detail-value">
                              {(submission.resubmissionCount || 0) + 1}
                            </span>
                          </div>
                          {submission.feedback && (
                            <div className="detail full-width">
                              <span className="detail-label">Feedback:</span>
                              <span className="detail-value feedback-text">
                                {submission.feedback}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="grade-actions">
                          <button 
                            onClick={() => handleViewGrade(submission)}
                            className="btn-secondary"
                          >
                            📋 Details
                          </button>
                        </div>
                      </div>
                    ))}
                  
                  {mySubmissions.filter(sub => sub.grade).length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <h3>No grades yet</h3>
                      <p>Your assignment grades will appear here once they're graded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grades-section">
                <h3>🎯 Quiz Results</h3>
                <div className="quiz-results-grid enhanced-grid">
                  {myQuizAttempts.map((attempt) => {
                    const quiz = availableQuizzes.find(q => q.id === attempt.quizId);
                    if (!quiz) return null;
                    
                    const percentage = (attempt.score / quiz.totalPoints) * 100;
                    const passed = attempt.passed;
                    
                    return (
                      <div key={attempt.id} className="quiz-result-card enhanced-card">
                        <div className="quiz-result-header">
                          <h4>{attempt.quizTitle}</h4>
                          <div className={`result-badge ${passed ? 'pass' : 'fail'}`}>
                            {passed ? '✅ PASS' : '❌ FAIL'}
                          </div>
                        </div>
                        <div className="quiz-result-details">
                          <div className="result-stat">
                            <span className="stat-label">Score</span>
                            <span className="stat-value score">
                              {attempt.score}/{quiz.totalPoints}
                            </span>
                          </div>
                          <div className="result-stat">
                            <span className="stat-label">Percentage</span>
                            <span className="stat-value percentage">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="result-stat">
                            <span className="stat-label">Passing Score</span>
                            <span className="stat-value">
                              {quiz.passingScore}%
                            </span>
                          </div>
                          <div className="result-stat">
                            <span className="stat-label">Submitted</span>
                            <span className="stat-value">
                              {new Date(attempt.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {attempt.timeTaken && (
                            <div className="result-stat">
                              <span className="stat-label">Time Taken</span>
                              <span className="stat-value">
                                {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="quiz-result-actions">
                          <button 
                            onClick={() => {
                              alert(`Quiz: ${attempt.quizTitle}\nScore: ${attempt.score}/${quiz.totalPoints} (${percentage.toFixed(1)}%)\nResult: ${passed ? 'PASS' : 'FAIL'}\nTime: ${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`);
                            }}
                            className="btn-secondary"
                          >
                            📋 View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {myQuizAttempts.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">🎯</div>
                      <h3>No quiz attempts yet</h3>
                      <p>Your quiz results will appear here once you start taking quizzes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="dashboard-overview">
            <PerformanceMetrics 
              submissions={mySubmissions}
              quizAttempts={myQuizAttempts}
            />
            
            <ProgressChart 
              submissions={mySubmissions}
              quizzes={myQuizAttempts}
            />

            <StudentNotifications 
              notifications={notifications}
              onClearNotification={handleClearNotification}
            />

            <div className="recent-activity-panel">
              <h3>🕒 Recent Activity</h3>
              <div className="activity-timeline">
                {[...mySubmissions, ...myQuizAttempts]
                  .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                  .slice(0, 6)
                  .map((item, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        {'quizTitle' in item ? '🎯' : '📝'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          {'quizTitle' in item 
                            ? `Completed quiz: "${item.quizTitle}" - Score: ${item.score}`
                            : `Submitted: "${item.assignmentName}"`
                          }
                        </p>
                        <span className="activity-time">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {'grade' in item && item.grade && (
                        <div className="activity-grade">
                          {item.grade}
                        </div>
                      )}
                    </div>
                  ))}
                
                {(mySubmissions.length === 0 && myQuizAttempts.length === 0) && (
                  <div className="empty-activity">
                    <div className="empty-icon">📚</div>
                    <p>No recent activity. Start by exploring available assignments!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="quick-actions-panel">
              <h3>⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <div 
                  className="quick-action-card"
                  onClick={() => setActiveSection("assignments")}
                >
                  <div className="action-icon">📝</div>
                  <div className="action-text">View Assignments</div>
                  <div className="action-count">{availableAssignments.length}</div>
                </div>
                <div 
                  className="quick-action-card"
                  onClick={() => setActiveSection("quizzes")}
                >
                  <div className="action-icon">🎯</div>
                  <div className="action-text">Take Quizzes</div>
                  <div className="action-count">{availableQuizzes.length}</div>
                </div>
                <div 
                  className="quick-action-card"
                  onClick={() => setActiveSection("submissions")}
                >
                  <div className="action-icon">📄</div>
                  <div className="action-text">My Submissions</div>
                  <div className="action-count">{mySubmissions.length}</div>
                </div>
                <div 
                  className="quick-action-card"
                  onClick={() => setActiveSection("grades")}
                >
                  <div className="action-icon">📊</div>
                  <div className="action-text">View Grades</div>
                  <div className="action-count">{mySubmissions.filter(sub => sub.grade).length}</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="dashboard enhanced-dashboard"
      style={{ background: `url(${studentBg}) no-repeat center center/cover` }}
    >
      {/* Enhanced Sidebar */}
      <div
        className={`sidebar enhanced-sidebar ${collapsed ? "collapsed" : ""} ${
          showSidebar ? "show" : ""
        }`}
      >
        <div className="sidebar-header">
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
          <div className="logo">
            {collapsed ? 'SP' : 'StudentPortal'}
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a 
            onClick={() => setActiveSection("")} 
            className={`nav-item ${activeSection === "" ? "active" : ""}`}
          >
            <span className="nav-icon">📊</span>
            {!collapsed && <span className="nav-text">Dashboard</span>}
          </a>
          <a 
            onClick={() => setActiveSection("assignments")} 
            className={`nav-item ${activeSection === "assignments" ? "active" : ""}`}
          >
            <span className="nav-icon">📚</span>
            {!collapsed && <span className="nav-text">Assignments</span>}
            {!collapsed && availableAssignments.length > 0 && (
              <span className="nav-badge">{availableAssignments.length}</span>
            )}
          </a>
          <a 
            onClick={() => setActiveSection("quizzes")} 
            className={`nav-item ${activeSection === "quizzes" ? "active" : ""}`}
          >
            <span className="nav-icon">🎯</span>
            {!collapsed && <span className="nav-text">Quizzes</span>}
            {!collapsed && availableQuizzes.length > 0 && (
              <span className="nav-badge">{availableQuizzes.length}</span>
            )}
          </a>
          <a 
            onClick={() => setActiveSection("submissions")} 
            className={`nav-item ${activeSection === "submissions" ? "active" : ""}`}
          >
            <span className="nav-icon">📝</span>
            {!collapsed && <span className="nav-text">My Submissions</span>}
            {!collapsed && mySubmissions.length > 0 && (
              <span className="nav-badge">{mySubmissions.length}</span>
            )}
          </a>
          <a 
            onClick={() => setActiveSection("grades")} 
            className={`nav-item ${activeSection === "grades" ? "active" : ""}`}
          >
            <span className="nav-icon">📈</span>
            {!collapsed && <span className="nav-text">My Grades</span>}
            {!collapsed && mySubmissions.filter(sub => sub.grade).length > 0 && (
              <span className="nav-badge">{mySubmissions.filter(sub => sub.grade).length}</span>
            )}
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            {!collapsed && (
             <div className="user-details">
  <div className="user-name">{userName}</div>
  <div className="user-role">Student</div>
  <div className="user-email">{user.email}</div>
</div>

            )}
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="main enhanced-main">
        <div className="top-bar enhanced-topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setShowSidebar(!showSidebar)}>
              ☰
            </button>
            <h1>
              {activeSection ? 
                activeSection.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
                : 'Dashboard'
              }
            </h1>
          </div>
          
          <div className="topbar-right">
            <div className="user-info">
  <span className="user-name">{userName}</span>
  <span className="user-role">• Student</span>
</div>

            <button className="logout-btn enhanced-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Enhanced Dashboard Stats */}
        {!activeSection && (
          <div className="stats enhanced-stats">
            <div className="stat-card enhanced-stat">
              <div className="stat-icon assignments">📚</div>
              <div className="stat-content">
                <h2>{dashboardStats.totalAssignments}</h2>
                <p>Total Assignments</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon submissions">📝</div>
              <div className="stat-content">
                <h2>{dashboardStats.totalSubmissions}</h2>
                <p>My Submissions</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon graded">📊</div>
              <div className="stat-content">
                <h2>{dashboardStats.gradedWork}</h2>
                <p>Graded Work</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon pending">⏳</div>
              <div className="stat-content">
                <h2>{dashboardStats.pendingAssignments}</h2>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon average">⭐</div>
              <div className="stat-content">
                <h2>{dashboardStats.averageGrade}</h2>
                <p>Avg Grade</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!activeSection && (
          <div className="actions enhanced-actions">
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("assignments")}
            >
              <div className="action-icon">📚</div>
              <div className="action-text">View Assignments</div>
              {availableAssignments.length > 0 && (
                <div className="action-badge">{availableAssignments.length}</div>
              )}
            </div>
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("quizzes")}
            >
              <div className="action-icon">🎯</div>
              <div className="action-text">Take Quizzes</div>
              {availableQuizzes.length > 0 && (
                <div className="action-badge">{availableQuizzes.length}</div>
              )}
            </div>
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("submissions")}
            >
              <div className="action-icon">📝</div>
              <div className="action-text">My Submissions</div>
              {mySubmissions.length > 0 && (
                <div className="action-badge">{mySubmissions.length}</div>
              )}
            </div>
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("grades")}
            >
              <div className="action-icon">📈</div>
              <div className="action-text">View Grades</div>
              {mySubmissions.filter(sub => sub.grade).length > 0 && (
                <div className="action-badge">{mySubmissions.filter(sub => sub.grade).length}</div>
              )}
            </div>
          </div>
        )}

        {/* Render active section */}
        {renderActiveSection()}
      </div>
    </div>
  );
}
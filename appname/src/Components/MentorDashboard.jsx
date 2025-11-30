import React, { useState, useEffect } from "react";
import "./MentorDashboard.css";
import "../App.css";
import mentorBg from "../assets/mentor.jpg";
import { useNavigate } from "react-router-dom";

// Enhanced Components
const GradeDistributionChart = ({ submissions }) => {
  const gradeRanges = {
    'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
  };

  submissions.forEach(sub => {
    if (sub.grade) {
      const grade = sub.grade[0].toUpperCase();
      if (gradeRanges.hasOwnProperty(grade)) {
        gradeRanges[grade]++;
      }
    }
  });

  return (
    <div className="chart-container">
      <h4>Grade Distribution</h4>
      <div className="chart-bars">
        {Object.entries(gradeRanges).map(([grade, count]) => (
          <div key={grade} className="chart-bar">
            <div 
              className="bar-fill"
              style={{ height: `${(count / submissions.length) * 100}%` }}
            ></div>
            <span className="bar-label">{grade}: {count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPanel = ({ submissions, quizzes, quizSubmissions }) => {
  const gradedSubmissions = submissions.filter(sub => sub.grade);
  const averageGrade = gradedSubmissions.length > 0 
    ? gradedSubmissions.reduce((acc, sub) => {
        const gradeValue = parseFloat(sub.grade) || 0;
        return acc + gradeValue;
      }, 0) / gradedSubmissions.length 
    : 0;

  const quizPassRate = quizSubmissions.length > 0
    ? (quizSubmissions.filter(sub => sub.passed).length / quizSubmissions.length) * 100
    : 0;

  return (
    <div className="analytics-panel">
      <h3>📈 Analytics Overview</h3>
      <div className="analytics-grid">
        <div className="analytic-card">
          <div className="analytic-value">{submissions.length}</div>
          <div className="analytic-label">Total Submissions</div>
        </div>
        <div className="analytic-card">
          <div className="analytic-value">{gradedSubmissions.length}</div>
          <div className="analytic-label">Graded</div>
        </div>
        <div className="analytic-card">
          <div className="analytic-value">{averageGrade.toFixed(1)}</div>
          <div className="analytic-label">Avg Grade</div>
        </div>
        <div className="analytic-card">
          <div className="analytic-value">{quizPassRate.toFixed(1)}%</div>
          <div className="analytic-label">Quiz Pass Rate</div>
        </div>
      </div>
      <GradeDistributionChart submissions={gradedSubmissions} />
    </div>
  );
};

const NotificationSystem = ({ notifications, onClearNotification }) => {
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
                {notification.type === 'submission' ? '📝' : 
                 notification.type === 'quiz' ? '🎯' : 'ℹ️'}
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

export default function MentorDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Upload assignments
  const [assignmentName, setAssignmentName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedAssignments, setUploadedAssignments] = useState([]);
  
  // Student submissions and grading
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  // Quiz/MCQ states
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDeadline, setQuizDeadline] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 1
  });
  const [passingScore, setPassingScore] = useState(70);
  const [uploadedQuizzes, setUploadedQuizzes] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

const userName =
  user?.name && isNaN(user.name)
    ? user.name
    : user?.email?.split("@")[0] || "Mentor";

const userID = user?.email?.split("@")[0].toUpperCase() || "MENTOR";

  
  // Enhanced data loading with notifications
  useEffect(() => {
    const savedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    setUploadedAssignments(savedAssignments);
    
    const savedSubmissions = JSON.parse(localStorage.getItem("studentSubmissions")) || [];
    setStudentSubmissions(savedSubmissions);

    const savedQuizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    setUploadedQuizzes(savedQuizzes);

    const savedQuizSubmissions = JSON.parse(localStorage.getItem("quizSubmissions")) || [];
    setQuizSubmissions(savedQuizSubmissions);

    // Generate notifications
    const newNotifications = [];
    const pendingGrading = savedSubmissions.filter(sub => !sub.grade);
    if (pendingGrading.length > 0) {
      newNotifications.push({
        type: 'submission',
        message: `${pendingGrading.length} assignments need grading`
      });
    }

    const recentQuizSubmissions = savedQuizSubmissions.filter(sub => 
      new Date(sub.submittedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (recentQuizSubmissions.length > 0) {
      newNotifications.push({
        type: 'quiz',
        message: `${recentQuizSubmissions.length} new quiz attempts`
      });
    }

    setNotifications(newNotifications);
  }, []);

  // Enhanced search and filter functionality
  const filteredSubmissions = studentSubmissions.filter(sub =>
    sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.assignmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = uploadedAssignments.filter(assignment =>
    assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.setItem('mentorLastLogin', new Date().toISOString());
    navigate("/");
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Enhanced assignment upload with validation
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!assignmentName || !deadline || !file) {
      alert("Please fill all fields and select a file.");
      return;
    }

    if (new Date(deadline) < new Date()) {
      alert("Deadline cannot be in the past.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newAssignment = {
        id: Date.now().toString(),
        assignmentName,
        deadline,
        fileName: file.name,
        fileData: reader.result,
        createdAt: new Date().toISOString(),
        type: "assignment",
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB"
      };

      const updatedAssignments = [...uploadedAssignments, newAssignment];
      setUploadedAssignments(updatedAssignments);
      localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

      setAssignmentName("");
      setDeadline("");
      setFile(null);
      
      // Add notification
      setNotifications(prev => [{
        type: 'info',
        message: `Assignment "${assignmentName}" uploaded successfully`
      }, ...prev]);
    };

    reader.readAsDataURL(file);
  };

  // Enhanced quiz creation
  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      alert("Please fill question and correct answer.");
      return;
    }

    if (currentQuestion.type === "multiple-choice" && currentQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all options for multiple choice question.");
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: Date.now().toString()
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handlePublishQuiz = () => {
    if (!quizTitle || !quizDeadline || questions.length === 0) {
      alert("Please fill quiz title, deadline and add at least one question.");
      return;
    }

    const newQuiz = {
      id: Date.now().toString(),
      title: quizTitle,
      deadline: quizDeadline,
      questions: questions,
      passingScore: passingScore,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      createdAt: new Date().toISOString(),
      type: "quiz",
      timeLimit: 60 // 60 minutes default
    };

    const updatedQuizzes = [...uploadedQuizzes, newQuiz];
    setUploadedQuizzes(updatedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));

    // Reset form
    setQuizTitle("");
    setQuizDeadline("");
    setQuestions([]);
    setPassingScore(70);
    
    setNotifications(prev => [{
      type: 'info',
      message: `Quiz "${quizTitle}" published successfully`
    }, ...prev]);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Enhanced grading system
  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
  };

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    if (!selectedSubmission || !grade) {
      alert("Please enter a grade.");
      return;
    }

    const updatedSubmissions = studentSubmissions.map(sub => 
      sub.id === selectedSubmission.id 
        ? { 
            ...sub, 
            grade, 
            feedback,
            gradedAt: new Date().toISOString(),
            status: "Graded",
            gradedBy: userName
          }
        : sub
    );

    setStudentSubmissions(updatedSubmissions);
    localStorage.setItem("studentSubmissions", JSON.stringify(updatedSubmissions));
    
    setNotifications(prev => [{
      type: 'info',
      message: `Graded submission from ${selectedSubmission.studentName}`
    }, ...prev]);

    setSelectedSubmission(null);
    setGrade("");
    setFeedback("");
  };

  const handleDownloadSubmission = (submission) => {
    if (submission.fileData) {
      const link = document.createElement('a');
      link.href = submission.fileData;
      link.download = submission.fileName || 'submission.pdf';
      link.click();
    }
  };

  // Enhanced quiz results view
  const handleViewQuizResults = (quiz) => {
    const quizSubs = quizSubmissions.filter(sub => sub.quizId === quiz.id);
    
    if (quizSubs.length === 0) {
      alert("No submissions for this quiz yet.");
      return;
    }

    const averageScore = quizSubs.reduce((sum, sub) => sum + sub.score, 0) / quizSubs.length;
    const passRate = (quizSubs.filter(sub => sub.passed).length / quizSubs.length) * 100;

    let results = `📊 Quiz: ${quiz.title}\n\n`;
    results += `Average Score: ${averageScore.toFixed(1)}/${quiz.totalPoints}\n`;
    results += `Pass Rate: ${passRate.toFixed(1)}%\n\n`;
    
    quizSubs.forEach((sub, index) => {
      const percentage = (sub.score / quiz.totalPoints) * 100;
      const passed = percentage >= quiz.passingScore;
      results += `${index + 1}. ${sub.studentName} - Score: ${sub.score}/${quiz.totalPoints} (${percentage.toFixed(1)}%) - ${passed ? '✅ PASS' : '❌ FAIL'}\n`;
    });

    alert(results);
  };

  const handleClearNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Enhanced dashboard statistics
  const dashboardStats = {
    pendingReviews: studentSubmissions.filter(sub => !sub.grade).length,
    quizzesCreated: uploadedQuizzes.length,
    quizAttempts: quizSubmissions.length,
    totalStudents: [...new Set(studentSubmissions.map(sub => sub.studentId))].length,
    averageGrade: studentSubmissions.filter(sub => sub.grade).length > 0 
      ? (studentSubmissions.filter(sub => sub.grade)
          .reduce((acc, sub) => acc + (parseFloat(sub.grade) || 0), 0) / 
         studentSubmissions.filter(sub => sub.grade).length).toFixed(1)
      : 0
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "upload":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>📤 Upload Assignment</h2>
              <div className="panel-actions">
                <button className="btn-secondary" onClick={() => {
                  setAssignmentName("");
                  setDeadline("");
                  setFile(null);
                }}>
                  Clear Form
                </button>
              </div>
            </div>
            
            <div className="form-container">
              <form onSubmit={handleUploadSubmit} className="enhanced-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Assignment Name *</label>
                    <input
                      type="text"
                      value={assignmentName}
                      onChange={(e) => setAssignmentName(e.target.value)}
                      placeholder="Enter assignment name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Deadline *</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Assignment File *</label>
                  <div className="file-upload-area">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="file-input"
                      required
                    />
                    <div className="file-upload-label">
                      {file ? `Selected: ${file.name}` : "Choose file or drag and drop"}
                    </div>
                  </div>
                  {file && (
                    <div className="file-info">
                      📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
                
                <button type="submit" className="btn-primary">
                  🚀 Upload Assignment
                </button>
              </form>
            </div>

            <div className="uploaded-assignments-section">
              <h3>📚 Uploaded Assignments ({uploadedAssignments.length})</h3>
              <div className="assignments-grid">
                {uploadedAssignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-icon">
                      {assignment.type === "quiz" ? "🎯" : "📝"}
                    </div>
                    <div className="assignment-content">
                      <h4>{assignment.assignmentName}</h4>
                      <div className="assignment-meta">
                        <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                        <span>Type: {assignment.type === "quiz" ? "Quiz" : "Assignment"}</span>
                        {assignment.fileSize && <span>Size: {assignment.fileSize}</span>}
                      </div>
                      <div className="assignment-stats">
                        <span className="stat">
                          📨 {studentSubmissions.filter(sub => sub.assignmentId === assignment.id).length} submissions
                        </span>
                        <span className="stat">
                          📊 {studentSubmissions.filter(sub => sub.assignmentId === assignment.id && sub.grade).length} graded
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "create-quiz":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>🎯 Create Quiz/MCQ Assignment</h2>
              <div className="quiz-stats">
                <span>Questions: {questions.length}</span>
                <span>Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</span>
              </div>
            </div>
            
            <div className="quiz-creation-wizard">
              <div className="wizard-step">
                <h3>📋 Quiz Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quiz Title *</label>
                    <input
                      type="text"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div className="form-group">
                    <label>Deadline *</label>
                    <input
                      type="datetime-local"
                      value={quizDeadline}
                      onChange={(e) => setQuizDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Passing Score (%) *</label>
                    <input
                      type="number"
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input
                      type="number"
                      defaultValue="60"
                      min="5"
                      max="180"
                    />
                  </div>
                </div>
              </div>

              <div className="wizard-step">
                <h3>❓ Add Questions</h3>
                <div className="question-form-card">
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Question Text *</label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                        placeholder="Enter your question"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Question Type</label>
                      <select
                        value={currentQuestion.type}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Points</label>
                      <input
                        type="number"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {currentQuestion.type === "multiple-choice" && (
                    <div className="form-group">
                      <label>Options *</label>
                      <div className="options-grid">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="option-input-group">
                            <span className="option-label">{String.fromCharCode(65 + index)}</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Correct Answer *</label>
                    {currentQuestion.type === "multiple-choice" ? (
                      <select
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                      >
                        <option value="">Select correct option</option>
                        {currentQuestion.options.map((option, index) => (
                          <option key={index} value={option} disabled={!option.trim()}>
                            {String.fromCharCode(65 + index)}: {option || `Option ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                        placeholder="Enter correct answer"
                      />
                    )}
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddQuestion} 
                    className="btn-secondary full-width"
                    disabled={!currentQuestion.question || !currentQuestion.correctAnswer}
                  >
                    ➕ Add Question to Quiz
                  </button>
                </div>
              </div>

              {questions.length > 0 && (
                <div className="wizard-step">
                  <h3>📝 Questions Preview ({questions.length})</h3>
                  <div className="questions-preview">
                    {questions.map((question, index) => (
                      <div key={question.id} className="question-preview-card">
                        <div className="question-header">
                          <div className="question-number">Q{index + 1}</div>
                          <div className="question-points">{question.points} pts</div>
                          <button 
                            onClick={() => handleDeleteQuestion(index)}
                            className="btn-danger btn-sm"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="question-text">{question.question}</div>
                        <div className="question-meta">
                          <span>Type: {question.type}</span>
                          <span>Answer: {question.correctAnswer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handlePublishQuiz}
                    className="btn-primary full-width"
                    disabled={!quizTitle || !quizDeadline}
                  >
                    🚀 Publish Quiz
                  </button>
                </div>
              )}
            </div>

            <div className="published-quizzes-section">
              <h3>📚 Published Quizzes ({uploadedQuizzes.length})</h3>
              <div className="quizzes-grid">
                {uploadedQuizzes.map((quiz) => {
                  const submissions = quizSubmissions.filter(sub => sub.quizId === quiz.id);
                  const averageScore = submissions.length > 0 
                    ? (submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={quiz.id} className="quiz-card">
                      <div className="quiz-header">
                        <h4>{quiz.title}</h4>
                        <div className="quiz-actions">
                          <button 
                            onClick={() => handleViewQuizResults(quiz)}
                            className="btn-secondary btn-sm"
                          >
                            📊 Results
                          </button>
                        </div>
                      </div>
                      <div className="quiz-stats">
                        <div className="stat">
                          <span className="stat-value">{quiz.questions.length}</span>
                          <span className="stat-label">Questions</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{submissions.length}</span>
                          <span className="stat-label">Attempts</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{averageScore}</span>
                          <span className="stat-label">Avg Score</span>
                        </div>
                      </div>
                      <div className="quiz-meta">
                        <span>Due: {new Date(quiz.deadline).toLocaleDateString()}</span>
                        <span>Passing: {quiz.passingScore}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>📑 Review Submissions</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by student or assignment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="submissions-overview">
              <div className="overview-stats">
                <div className="overview-stat pending">
                  <span className="stat-count">{studentSubmissions.filter(sub => !sub.grade).length}</span>
                  <span className="stat-label">Pending Review</span>
                </div>
                <div className="overview-stat graded">
                  <span className="stat-count">{studentSubmissions.filter(sub => sub.grade).length}</span>
                  <span className="stat-label">Graded</span>
                </div>
                <div className="overview-stat total">
                  <span className="stat-count">{studentSubmissions.length}</span>
                  <span className="stat-label">Total Submissions</span>
                </div>
              </div>
            </div>

            <div className="submissions-list enhanced-list">
              {filteredSubmissions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No submissions found</h3>
                  <p>{searchTerm ? "Try adjusting your search terms" : "No submissions have been made yet"}</p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="submission-card enhanced-card">
                    <div className="submission-main">
                      <div className="submission-avatar">
                        {submission.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="submission-info">
                        <h4>{submission.studentName}</h4>
                        <p className="assignment-name">{submission.assignmentName}</p>
                        <div className="submission-meta">
                          <span className="submission-date">
                            📅 {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          {submission.resubmissionCount > 0 && (
                            <span className="resubmission-badge">
                              🔄 {submission.resubmissionCount + 1} attempts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="submission-status">
                      <span className={`status-badge ${submission.status?.toLowerCase() || 'submitted'}`}>
                        {submission.status || "Submitted"}
                      </span>
                      {submission.grade && (
                        <div className="grade-display">
                          <strong>Grade: {submission.grade}</strong>
                        </div>
                      )}
                    </div>

                    <div className="submission-actions">
                      <button 
                        onClick={() => handleViewSubmission(submission)}
                        className={`action-btn ${submission.grade ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {submission.grade ? '👁️ View' : '📝 Grade'}
                      </button>
                      <button 
                        onClick={() => handleDownloadSubmission(submission)}
                        className="btn-secondary"
                      >
                        📥 Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedSubmission && (
              <div className="grading-modal modal-overlay">
                <div className="modal-content enhanced-modal">
                  <div className="modal-header">
                    <h3>📊 Grade Submission</h3>
                    <button 
                      onClick={() => setSelectedSubmission(null)}
                      className="modal-close"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="submission-details-card">
                    <div className="detail-row">
                      <span className="detail-label">Student:</span>
                      <span className="detail-value">{selectedSubmission.studentName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Assignment:</span>
                      <span className="detail-value">{selectedSubmission.assignmentName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedSubmission.resubmissionCount > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Attempts:</span>
                        <span className="detail-value">{selectedSubmission.resubmissionCount + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSubmitGrade} className="grading-form">
                    <div className="form-group">
                      <label>Grade *</label>
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Enter grade (e.g., A, 95/100, 85%)"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Feedback</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive feedback to the student..."
                        rows="4"
                      />
                    </div>
                    
                    <div className="modal-actions">
                      <button type="submit" className="btn-primary">
                        ✅ Submit Grade
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setSelectedSubmission(null)}
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

      case "grades":
        return (
          <div className="panel enhanced-panel">
            <div className="panel-header">
              <h2>📈 Grades & Results</h2>
              <AnalyticsPanel 
                submissions={studentSubmissions}
                quizzes={uploadedQuizzes}
                quizSubmissions={quizSubmissions}
              />
            </div>

            <div className="grades-tabs">
              <div className="tab-content active">
                <h3>📝 Assignment Grades</h3>
                <div className="grades-grid">
                  {studentSubmissions
                    .filter(sub => sub.grade)
                    .map((submission) => (
                      <div key={submission.id} className="grade-card enhanced-card">
                        <div className="grade-header">
                          <h4>{submission.assignmentName}</h4>
                          <span className="grade-badge">{submission.grade}</span>
                        </div>
                        <div className="grade-details">
                          <div className="detail">
                            <span className="detail-label">Student:</span>
                            <span className="detail-value">{submission.studentName}</span>
                          </div>
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
                          {submission.feedback && (
                            <div className="detail full-width">
                              <span className="detail-label">Feedback:</span>
                              <span className="detail-value feedback-text">
                                {submission.feedback}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {studentSubmissions.filter(sub => sub.grade).length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <h3>No grades yet</h3>
                      <p>Grades will appear here once you start grading submissions</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="tab-content">
                <h3>🎯 Quiz Results</h3>
                <div className="quiz-results-grid">
                  {quizSubmissions.map((submission) => {
                    const quiz = uploadedQuizzes.find(q => q.id === submission.quizId);
                    if (!quiz) return null;
                    
                    const percentage = (submission.score / quiz.totalPoints) * 100;
                    const passed = percentage >= quiz.passingScore;
                    
                    return (
                      <div key={submission.id} className="quiz-result-card enhanced-card">
                        <div className="quiz-result-header">
                          <h4>{submission.quizTitle}</h4>
                          <div className={`result-badge ${passed ? 'pass' : 'fail'}`}>
                            {passed ? '✅ PASS' : '❌ FAIL'}
                          </div>
                        </div>
                        <div className="quiz-result-details">
                          <div className="result-stat">
                            <span className="stat-label">Student</span>
                            <span className="stat-value">{submission.studentName}</span>
                          </div>
                          <div className="result-stat">
                            <span className="stat-label">Score</span>
                            <span className="stat-value score">
                              {submission.score}/{quiz.totalPoints}
                            </span>
                          </div>
                          <div className="result-stat">
                            <span className="stat-label">Percentage</span>
                            <span className="stat-value percentage">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="result-stat">
                            <span className="stat-label">Submitted</span>
                            <span className="stat-value">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {quizSubmissions.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">🎯</div>
                      <h3>No quiz attempts yet</h3>
                      <p>Quiz results will appear here once students start taking quizzes</p>
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
            <AnalyticsPanel 
              submissions={studentSubmissions}
              quizzes={uploadedQuizzes}
              quizSubmissions={quizSubmissions}
            />
            
            <NotificationSystem 
              notifications={notifications}
              onClearNotification={handleClearNotification}
            />

            <div className="recent-activity-panel">
              <h3>🕒 Recent Activity</h3>
              <div className="activity-timeline">
                {[...uploadedQuizzes, ...studentSubmissions]
                  .sort((a, b) => new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt))
                  .slice(0, 8)
                  .map((item, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        {item.type === 'quiz' ? '🎯' : '📝'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          {item.type === 'quiz' 
                            ? `Created quiz: "${item.title}"`
                            : `New submission from ${item.studentName}`
                          }
                        </p>
                        <span className="activity-time">
                          {new Date(item.createdAt || item.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="dashboard enhanced-dashboard"
      style={{ background: `url(${mentorBg}) no-repeat center center/cover` }}
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
            {collapsed ? 'MP' : 'MentorPortal'}
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
            onClick={() => setActiveSection("upload")} 
            className={`nav-item ${activeSection === "upload" ? "active" : ""}`}
          >
            <span className="nav-icon">📤</span>
            {!collapsed && <span className="nav-text">Upload Assignments</span>}
          </a>
          <a 
            onClick={() => setActiveSection("create-quiz")} 
            className={`nav-item ${activeSection === "create-quiz" ? "active" : ""}`}
          >
            <span className="nav-icon">🎯</span>
            {!collapsed && <span className="nav-text">Create Quiz</span>}
          </a>
          <a 
            onClick={() => setActiveSection("review")} 
            className={`nav-item ${activeSection === "review" ? "active" : ""}`}
          >
            <span className="nav-icon">📑</span>
            {!collapsed && <span className="nav-text">Review Submissions</span>}
            {!collapsed && dashboardStats.pendingReviews > 0 && (
              <span className="nav-badge">{dashboardStats.pendingReviews}</span>
            )}
          </a>
          <a 
            onClick={() => setActiveSection("grades")} 
            className={`nav-item ${activeSection === "grades" ? "active" : ""}`}
          >
            <span className="nav-icon">📈</span>
            {!collapsed && <span className="nav-text">Grades & Results</span>}
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
  <div className="user-role">Mentor</div>
<div className="user-id">
  {user?.email?.split("@")[0]}
</div>

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
  <span className="user-role">• Mentor</span>
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
              <div className="stat-icon pending">📝</div>
              <div className="stat-content">
                <h2>{dashboardStats.pendingReviews}</h2>
                <p>Reviews Due</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon quiz">🎯</div>
              <div className="stat-content">
                <h2>{dashboardStats.quizzesCreated}</h2>
                <p>Quizzes Created</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon attempts">📊</div>
              <div className="stat-content">
                <h2>{dashboardStats.quizAttempts}</h2>
                <p>Quiz Attempts</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon students">👥</div>
              <div className="stat-content">
                <h2>{dashboardStats.totalStudents}</h2>
                <p>Total Students</p>
              </div>
            </div>
            <div className="stat-card enhanced-stat">
              <div className="stat-icon grade">⭐</div>
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
              onClick={() => setActiveSection("upload")}
            >
              <div className="action-icon">📤</div>
              <div className="action-text">Upload Assignments</div>
            </div>
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("create-quiz")}
            >
              <div className="action-icon">🎯</div>
              <div className="action-text">Create Quiz</div>
            </div>
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("review")}
            >
              <div className="action-icon">📑</div>
              <div className="action-text">Review Submissions</div>
              {dashboardStats.pendingReviews > 0 && (
                <div className="action-badge">{dashboardStats.pendingReviews}</div>
              )}
            </div>
            <div 
              className="action-card enhanced-action" 
              onClick={() => setActiveSection("grades")}
            >
              <div className="action-icon">📈</div>
              <div className="action-text">View Results</div>
            </div>
          </div>
        )}

        {/* Render active section */}
        {renderActiveSection()}
      </div>
    </div>
  );
}
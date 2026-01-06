import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [marks, setMarks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    const initializeData = async () => {
      await fetchMarks();
      await fetchComments();
    };
    initializeData();
  }, []);

  const fetchMarks = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      setStudentEmail(email || "");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get("http://localhost:5000/student/marks", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMarks(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch marks error:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      } else {
        setError(err.response?.data?.message || "Failed to fetch marks");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get("http://localhost:5000/student/comments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setComments(response.data.data || []);
      }
    } catch (err) {
      console.error('Fetch comments error:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
      // Don't show error for comments as it's not critical
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getGradeColor = (grade) => {
    const colors = {
      'S': '#10b981', // green
      'A': '#3b82f6', // blue
      'B': '#8b5cf6', // purple
      'C': '#f59e0b', // yellow
      'D': '#ef4444', // red
      'F': '#dc2626'  // dark red
    };
    return colors[grade] || '#6b7280';
  };

  const calculateOverallGrade = () => {
    if (marks.length === 0) return 'N/A';
    const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
    const average = totalMarks / marks.length;
    
    if (average >= 90) return 'S';
    if (average >= 80) return 'A';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C';
    if (average >= 50) return 'D';
    return 'F';
  };

  const calculateAverage = () => {
    if (marks.length === 0) return 0;
    const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
    return (totalMarks / marks.length).toFixed(1);
  };

  const getCommentForCourse = (courseCode) => {
    return comments.find(comment => comment.courseCode === courseCode);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your marks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Student Dashboard</h1>
            <p>Welcome back, {studentEmail}</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Courses</h3>
            <div className="stat-value">{marks.length}</div>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <div className="stat-value">{calculateAverage()}%</div>
          </div>
          <div className="stat-card">
            <h3>Overall Grade</h3>
            <div 
              className="stat-value grade"
              style={{ color: getGradeColor(calculateOverallGrade()) }}
            >
              {calculateOverallGrade()}
            </div>
          </div>
        </div>

        <div className="marks-section">
          <h2>Your Marks & Comments</h2>
          {marks.length === 0 ? (
            <div className="no-data">
              <p>No marks available yet. Please check back later.</p>
            </div>
          ) : (
            <div className="marks-grid">
              {marks.map((mark, index) => {
                const comment = getCommentForCourse(mark.courseCode);
                return (
                  <div key={`${mark.courseCode}-${index}`} className="mark-card">
                    <div className="course-header">
                      <h3>{mark.courseCode}</h3>
                      <div 
                        className="grade-badge"
                        style={{ backgroundColor: getGradeColor(mark.grade) }}
                      >
                        {mark.grade}
                      </div>
                    </div>
                    <div className="marks-display">
                      <span className="marks-value">{mark.marks}</span>
                      <span className="marks-total">/100</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${mark.marks}%`,
                          backgroundColor: getGradeColor(mark.grade)
                        }}
                      ></div>
                    </div>
                    {comment && (
                      <div className="comment-section">
                        <h4>Faculty Feedback:</h4>
                        <p className="comment-text">{comment.comment}</p>
                        <small className="comment-date">
                          Updated: {new Date(comment.updatedAt).toLocaleDateString()}
                        </small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

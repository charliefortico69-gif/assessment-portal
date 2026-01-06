import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('addMarks');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Add marks form state
  const [markForm, setMarkForm] = useState({
    studentEmail: "",
    marks: ""
  });
  
  // Comment form state
  const [commentForm, setCommentForm] = useState({
    studentEmail: "",
    comment: ""
  });
  
  // Statistics state
  const [statistics, setStatistics] = useState({});
  const [students, setStudents] = useState([]);
  const [assignedCourse, setAssignedCourse] = useState("");
  const [facultyName, setFacultyName] = useState("");
  
  const courses = {
    'CS101': 'Computer Science Fundamentals',
    'MA102': 'Mathematics for Engineers',
    'EC201': 'Electronics and Communication',
    'PH301': 'Physics for Engineers',
    'CH401': 'Chemistry Fundamentals',
    'EN501': 'English Communication'
  };

  useEffect(() => {
    fetchAssignedCourse();
    fetchStatistics();
    fetchStudents();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAssignedCourse = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get("http://localhost:5000/faculty/course", { headers });
      if (response.data.success) {
        setAssignedCourse(response.data.data.assignedCourse || "");
        setFacultyName(response.data.data.name || "");
      }
    } catch (err) {
      console.error('Fetch assigned course error:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      } else {
        setError("Failed to fetch course information");
      }
    }
  };

  const fetchStatistics = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get("http://localhost:5000/faculty/statistics", { headers });
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error('Fetch statistics error:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  };

  const fetchStudents = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get("http://localhost:5000/faculty/students", { headers });
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleMarkFormChange = (e) => {
    setMarkForm({
      ...markForm,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleCommentFormChange = (e) => {
    setCommentForm({
      ...commentForm,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    if (!assignedCourse) {
      setError("No course assigned to you");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      await axios.post("http://localhost:5000/faculty/addMarks", {
        ...markForm,
        courseCode: assignedCourse
      }, { headers });
      setSuccess("Marks added successfully!");
      setMarkForm({ studentEmail: "", marks: "" });
      fetchStatistics();
    } catch (err) {
      console.error('Add marks error:', err);
      setError(err.response?.data?.message || "Failed to add marks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!assignedCourse) {
      setError("No course assigned to you");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      await axios.post("http://localhost:5000/faculty/addComment", commentForm, { headers });
      setSuccess("Comment added successfully!");
      setCommentForm({ studentEmail: "", comment: "" });
    } catch (err) {
      console.error('Add comment error:', err);
      setError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getGradeColor = (grade) => {
    const colors = {
      'S': '#10b981',
      'A': '#3b82f6',
      'B': '#8b5cf6',
      'C': '#f59e0b',
      'D': '#ef4444',
      'F': '#dc2626'
    };
    return colors[grade] || '#6b7280';
  };

  if (!assignedCourse && activeTab !== 'addMarks') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div>
              <h1>Faculty Dashboard</h1>
              <p>Welcome, {facultyName}</p>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <div className="error-message">
            No course assigned to you. Please contact the administrator.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Faculty Dashboard</h1>
            <p>Managing {assignedCourse} - {courses[assignedCourse] || 'Unknown Course'}</p>
            <small>Welcome, {facultyName}</small>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'addMarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('addMarks')}
        >
          Add Marks
        </button>
        <button 
          className={`tab-button ${activeTab === 'addComments' ? 'active' : ''}`}
          onClick={() => setActiveTab('addComments')}
        >
          Add Comments
        </button>
        <button 
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </nav>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'addMarks' && (
          <div className="add-marks-section">
            <h2>Add/Update Student Marks for {assignedCourse}</h2>
            <form onSubmit={handleAddMarks} className="marks-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentEmail">Student Email</label>
                  <select
                    id="studentEmail"
                    name="studentEmail"
                    value={markForm.studentEmail}
                    onChange={handleMarkFormChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student._id} value={student.email}>
                        {student.email} {student.name && `(${student.name})`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="marks">Marks (0-100)</label>
                  <input
                    type="number"
                    id="marks"
                    name="marks"
                    value={markForm.marks}
                    onChange={handleMarkFormChange}
                    min="0"
                    max="100"
                    placeholder="Enter marks"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <button type="submit" className="submit-button" disabled={loading || !assignedCourse}>
                {loading ? "Adding..." : "Add/Update Marks"}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'addComments' && (
          <div className="add-comments-section">
            <h2>Add/Update Student Comments for {assignedCourse}</h2>
            <form onSubmit={handleAddComment} className="comment-form">
              <div className="form-group">
                <label htmlFor="commentStudentEmail">Student Email</label>
                <select
                  id="commentStudentEmail"
                  name="studentEmail"
                  value={commentForm.studentEmail}
                  onChange={handleCommentFormChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student._id} value={student.email}>
                      {student.email} {student.name && `(${student.name})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="comment">Comment/Guidance</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={commentForm.comment}
                  onChange={handleCommentFormChange}
                  placeholder="Enter feedback or guidance for the student..."
                  rows="4"
                  maxLength="1000"
                  required
                  disabled={loading}
                />
                <small>Maximum 1000 characters ({commentForm.comment.length}/1000)</small>
              </div>
              
              <button type="submit" className="submit-button" disabled={loading || !assignedCourse}>
                {loading ? "Adding..." : "Add/Update Comment"}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="statistics-section">
            <h2>Course Statistics for {assignedCourse}</h2>
            <div className="course-stats-card">
              <div className="course-header">
                <h3>{assignedCourse}</h3>
                <p>{courses[assignedCourse] || 'Unknown Course'}</p>
              </div>
              
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Students:</span>
                  <span className="stat-value">{statistics.totalStudents || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average:</span>
                  <span className="stat-value">{statistics.average || 0}%</span>
                </div>
              </div>
              
              <div className="grade-distribution">
                <h4>Grade Distribution</h4>
                <div className="grade-bars">
                  {Object.entries(statistics.gradeDistribution || { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }).map(([grade, count]) => (
                    <div key={grade} className="grade-bar">
                      <span className="grade-label">{grade}</span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill"
                          style={{
                            width: statistics.totalStudents > 0 ? `${(count / statistics.totalStudents) * 100}%` : '0%',
                            backgroundColor: getGradeColor(grade)
                          }}
                        ></div>
                      </div>
                      <span className="grade-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

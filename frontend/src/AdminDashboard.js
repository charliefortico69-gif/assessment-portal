import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [users, setUsers] = useState([]);
  const [marks, setMarks] = useState([]);
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchMarks();
    fetchStatistics();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
    role: "",
    name: "",
    assignedCourse: ""
  });

  const fetchUsers = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get("http://localhost:5000/admin/users", { headers });
      setUsers(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  };

  const fetchMarks = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      console.log('Fetching marks for admin...');
      const response = await axios.get("http://localhost:5000/admin/marks", { headers });
      console.log('Marks response:', response.data);
      setMarks(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch marks:', err);
      setError('Failed to load marks data');
    }
  };

  const fetchStatistics = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.get("http://localhost:5000/admin/statistics", { headers });
      setStatistics(response.data.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleUserFormChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      await axios.post("http://localhost:5000/admin/users", userForm, { headers });
      setSuccess("User created successfully!");
      setUserForm({ email: "", password: "", role: "", name: "", assignedCourse: "" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      await axios.delete(`http://localhost:5000/admin/users/${userId}`, { headers });
      setSuccess("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System Administration & User Management</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveTab('marks')}
        >
          All Marks
        </button>
        <button 
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          System Statistics
        </button>
      </nav>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>User Management</h2>
            
            <div className="create-user-form">
              <h3>Create New User</h3>
              <form onSubmit={handleCreateUser} className="marks-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserFormChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleUserFormChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={userForm.role}
                      onChange={handleUserFormChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Role</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={userForm.name}
                      onChange={handleUserFormChange}
                      disabled={loading}
                    />
                  </div>
                  
                  {userForm.role === 'faculty' && (
                    <div className="form-group">
                      <label htmlFor="assignedCourse">Assigned Course</label>
                      <select
                        id="assignedCourse"
                        name="assignedCourse"
                        value={userForm.assignedCourse}
                        onChange={handleUserFormChange}
                        disabled={loading}
                      >
                        <option value="">Select Course</option>
                        <option value="CS101">CS101</option>
                        <option value="MA102">MA102</option>
                        <option value="EC201">EC201</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? "Creating..." : "Create User"}
                </button>
              </form>
            </div>

            <div className="users-table">
              <h3>All Users</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Assigned Course</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.email}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.assignedCourse || 'N/A'}</td>
                      <td>
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'marks' && (
          <div className="admin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>All Student Marks</h2>
              <button 
                onClick={() => { fetchMarks(); setSuccess('Marks data refreshed!'); }}
                className="submit-button"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Refresh Data
              </button>
            </div>
            {marks.length === 0 ? (
              <div className="no-data">
                <p>No marks data available. Make sure students have been assigned marks.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Email</th>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((mark, index) => (
                    <tr key={index}>
                      <td>{mark.studentEmail}</td>
                      <td>{mark.courseCode}</td>
                      <td>{mark.marks}</td>
                      <td>
                        <span className={`grade-badge grade-${mark.grade}`}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="admin-section">
            <h2>System Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-value">{statistics.totalUsers || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Students</h3>
                <div className="stat-value">{statistics.totalStudents || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Faculty</h3>
                <div className="stat-value">{statistics.totalFaculty || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total Marks</h3>
                <div className="stat-value">{statistics.totalMarks || 0}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
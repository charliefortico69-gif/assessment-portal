import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config/api";
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('regular'); // 'regular' or 'admin'
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('Attempting login with:', formData);
      
      const res = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Login response:', res.data);
      
      const { token, role, email } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      if (role === "student") {
        navigate("/student");
      } else if (role === "faculty") {
        navigate("/faculty");
      } else if (role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Assessment Portal</h1>
          <p>Internal Student Assessment System</p>
        </div>

        {/* Login Type Tabs */}
        <div className="login-tabs">
          <button 
            className={`tab-btn ${loginType === 'regular' ? 'active' : ''}`}
            onClick={() => setLoginType('regular')}
          >
            Student / Faculty
          </button>
          <button 
            className={`tab-btn admin-tab ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => setLoginType('admin')}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          {loginType === 'admin' ? (
            <p><strong>Admin:</strong> admin@test.com / password123</p>
          ) : (
            <>
              <p><strong>Faculty CS101:</strong> faculty.cs@test.com / password123</p>
              <p><strong>Faculty MA102:</strong> faculty.ma@test.com / password123</p>
              <p><strong>Faculty EC201:</strong> faculty.ec@test.com / password123</p>
              <p><strong>Faculty PH301:</strong> faculty.ph@test.com / password123</p>
              <p><strong>Faculty CH401:</strong> faculty.ch@test.com / password123</p>
              <p><strong>Faculty EN501:</strong> faculty.en@test.com / password123</p>
              <p><strong>Student:</strong> student1@test.com / password123</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

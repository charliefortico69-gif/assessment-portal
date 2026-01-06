import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import AdminDashboard from "./AdminDashboard";

// Protected route component for students
function ProtectedStudent({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token || role !== "student") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Protected route component for faculty
function ProtectedFaculty({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token || role !== "faculty") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Protected route component for admin
function ProtectedAdmin({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token || role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Redirect authenticated users away from login
function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (token && role) {
    if (role === "student") return <Navigate to="/student" replace />;
    if (role === "faculty") return <Navigate to="/faculty" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        <Route
          path="/student"
          element={
            <ProtectedStudent>
              <StudentDashboard />
            </ProtectedStudent>
          }
        />

        <Route
          path="/faculty"
          element={
            <ProtectedFaculty>
              <FacultyDashboard />
            </ProtectedFaculty>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

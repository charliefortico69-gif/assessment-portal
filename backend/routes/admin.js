const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Marks = require("../models/Marks");
const bcrypt = require("bcryptjs");

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Get all users
router.get("/users", checkAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ role: 1, email: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new user
router.post("/users", checkAdmin, async (req, res) => {
  try {
    const { email, password, role, name, assignedCourse } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role required" });
    }
    
    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      email,
      password: hashedPassword,
      role,
      name
    };
    
    if (role === 'faculty' && assignedCourse) {
      userData.assignedCourse = assignedCourse;
    }
    
    const user = await User.create(userData);
    
    res.status(201).json({ 
      success: true, 
      message: "User created successfully",
      data: { email: user.email, role: user.role, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user
router.put("/users/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, name, assignedCourse } = req.body;
    
    const updateData = { email, role, name };
    if (role === 'faculty' && assignedCourse) {
      updateData.assignedCourse = assignedCourse;
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete user
router.delete("/users/:id", checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Delete associated marks
    await Marks.deleteMany({ studentEmail: user.email });
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all marks (admin view)
router.get("/marks", checkAdmin, async (req, res) => {
  try {
    const marks = await Marks.find({}).sort({ studentEmail: 1, courseCode: 1 });
    res.json({ success: true, data: marks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get system statistics
router.get("/statistics", checkAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalMarks = await Marks.countDocuments();
    
    const courses = ['CS101', 'MA102', 'EC201'];
    const courseStats = {};
    
    for (const course of courses) {
      const marks = await Marks.find({ courseCode: course });
      const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
      const average = marks.length > 0 ? (totalMarks / marks.length).toFixed(2) : 0;
      
      courseStats[course] = {
        totalStudents: marks.length,
        average: parseFloat(average)
      };
    }
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalMarks,
        courseStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
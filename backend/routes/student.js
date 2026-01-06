const express = require("express");
const router = express.Router();
const Marks = require("../models/Marks");
const Comment = require("../models/Comment");

// Get student's own marks only
router.get("/marks", async (req, res) => {
  try {
    // Use email from JWT token, not from query params for security
    const studentEmail = req.user.email;
    
    // Verify user is actually a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: "Access denied. Students only." });
    }
    
    const marks = await Marks.find({ studentEmail }).sort({ courseCode: 1 });
    
    res.json({
      success: true,
      data: marks,
      student: studentEmail
    });
  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get student's marks for a specific course
router.get("/marks/:courseCode", async (req, res) => {
  try {
    const studentEmail = req.user.email;
    const { courseCode } = req.params;
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: "Access denied. Students only." });
    }
    
    const mark = await Marks.findOne({ studentEmail, courseCode: courseCode.toUpperCase() });
    
    if (!mark) {
      return res.status(404).json({ message: "Marks not found for this course" });
    }
    
    res.json({
      success: true,
      data: mark
    });
  } catch (error) {
    console.error('Get student course marks error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get student's own comments only
router.get("/comments", async (req, res) => {
  try {
    const studentEmail = req.user.email;
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: "Access denied. Students only." });
    }
    
    const comments = await Comment.find({ studentEmail }).sort({ courseCode: 1 });
    
    res.json({
      success: true,
      data: comments,
      student: studentEmail
    });
  } catch (error) {
    console.error('Get student comments error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

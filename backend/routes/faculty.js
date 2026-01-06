const express = require("express");
const router = express.Router();
const Marks = require("../models/Marks");
const User = require("../models/User");
const Comment = require("../models/Comment");

// Middleware to check if user is faculty
const checkFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ message: "Access denied. Faculty only." });
  }
  next();
};

// Add or update marks (only for assigned course)
router.post("/addMarks", checkFaculty, async (req, res) => {
  try {
    const { studentEmail, courseCode, marks } = req.body;
    
    if (!studentEmail || !courseCode || marks === undefined) {
      return res.status(400).json({ message: "All fields required" });
    }
    
    // Check if faculty is assigned to this course
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty || !faculty.assignedCourse) {
      return res.status(400).json({ message: "No course assigned to faculty" });
    }
    
    if (faculty.assignedCourse !== courseCode.toUpperCase()) {
      return res.status(403).json({ message: "Access denied. You can only manage marks for your assigned course." });
    }
    
    // Verify student exists
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Update or create marks
    const result = await Marks.findOneAndUpdate(
      { studentEmail: studentEmail.toLowerCase(), courseCode: courseCode.toUpperCase() },
      { marks: Number(marks) },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true,
      message: "Marks updated successfully",
      data: result
    });
  } catch (error) {
    console.error('Add marks error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Marks already exist for this student and course" });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
});

// Add or update comment (only for assigned course)
router.post("/addComment", checkFaculty, async (req, res) => {
  try {
    const { studentEmail, comment } = req.body;
    
    if (!studentEmail || !comment) {
      return res.status(400).json({ message: "Student email and comment are required" });
    }
    
    // Get faculty's assigned course
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty || !faculty.assignedCourse) {
      return res.status(400).json({ message: "No course assigned to faculty" });
    }
    
    // Verify student exists
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Update or create comment
    const result = await Comment.findOneAndUpdate(
      { studentEmail: studentEmail.toLowerCase(), courseCode: faculty.assignedCourse },
      { comment: comment.trim(), facultyEmail: req.user.email },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true,
      message: "Comment updated successfully",
      data: result
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all students' marks for faculty's assigned course
router.get("/course/marks", checkFaculty, async (req, res) => {
  try {
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty || !faculty.assignedCourse) {
      return res.status(400).json({ message: "No course assigned to faculty" });
    }
    
    const marks = await Marks.find({ courseCode: faculty.assignedCourse })
                            .sort({ marks: -1 });
    
    res.json({
      success: true,
      data: marks,
      course: faculty.assignedCourse
    });
  } catch (error) {
    console.error('Get course marks error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get statistics for faculty's assigned course
router.get("/statistics", checkFaculty, async (req, res) => {
  try {
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty || !faculty.assignedCourse) {
      return res.status(400).json({ message: "No course assigned to faculty" });
    }
    
    const marks = await Marks.find({ courseCode: faculty.assignedCourse });
    
    if (marks.length === 0) {
      return res.json({
        success: true,
        data: {
          course: faculty.assignedCourse,
          totalStudents: 0,
          average: 0,
          gradeDistribution: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
        }
      });
    }
    
    const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
    const average = (totalMarks / marks.length).toFixed(2);
    
    const gradeDistribution = marks.reduce((dist, mark) => {
      dist[mark.grade] = (dist[mark.grade] || 0) + 1;
      return dist;
    }, { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 });
    
    res.json({
      success: true,
      data: {
        course: faculty.assignedCourse,
        totalStudents: marks.length,
        average: parseFloat(average),
        gradeDistribution
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all students
router.get("/students", checkFaculty, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, 'email name').sort({ email: 1 });
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete comment (only for assigned course)
router.delete("/deleteComment/:studentEmail", checkFaculty, async (req, res) => {
  try {
    const { studentEmail } = req.params;
    
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty || !faculty.assignedCourse) {
      return res.status(400).json({ message: "No course assigned to faculty" });
    }
    
    const result = await Comment.findOneAndDelete({
      studentEmail: studentEmail.toLowerCase(),
      courseCode: faculty.assignedCourse,
      facultyEmail: req.user.email
    });
    
    if (!result) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    res.json({ 
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get comments for faculty's assigned course
router.get("/comments", checkFaculty, async (req, res) => {
  try {
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty || !faculty.assignedCourse) {
      return res.status(400).json({ message: "No course assigned to faculty" });
    }
    
    const comments = await Comment.find({ 
      courseCode: faculty.assignedCourse,
      facultyEmail: req.user.email 
    }).sort({ studentEmail: 1 });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get faculty's assigned course
router.get("/course", checkFaculty, async (req, res) => {
  try {
    const faculty = await User.findOne({ email: req.user.email, role: 'faculty' });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    
    res.json({
      success: true,
      data: { 
        assignedCourse: faculty.assignedCourse || null,
        name: faculty.name || 'Unknown Faculty'
      }
    });
  } catch (error) {
    console.error('Get faculty course error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
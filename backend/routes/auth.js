const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register route (for testing - remove in production)
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, assignedCourse } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }
    
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    if (role === 'faculty' && !assignedCourse) {
      return res.status(400).json({ message: "Faculty must have an assigned course" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role
    };
    
    if (role === 'faculty') {
      userData.assignedCourse = assignedCourse;
    }
    
    const user = await User.create(userData);
    
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: "Server configuration error" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email, role: user.role, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      token, 
      role: user.role,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
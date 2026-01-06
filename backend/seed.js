require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Marks = require('./models/Marks');
const Comment = require('./models/Comment');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/internalPortal");
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Marks.deleteMany({});
    await Comment.deleteMany({});

    // Create courses
    const courses = [
      { code: 'CS101', name: 'Computer Science Fundamentals', description: 'Introduction to programming and algorithms' },
      { code: 'MA102', name: 'Mathematics for Engineers', description: 'Calculus and linear algebra' },
      { code: 'EC201', name: 'Electronics and Communication', description: 'Basic electronics and communication systems' },
      { code: 'PH301', name: 'Physics for Engineers', description: 'Applied physics and mechanics' },
      { code: 'CH401', name: 'Chemistry Fundamentals', description: 'Basic chemistry and materials science' },
      { code: 'EN501', name: 'English Communication', description: 'Technical writing and communication skills' }
    ];

    await Course.insertMany(courses);
    console.log('Courses created');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      // Admin user
      { email: 'admin@test.com', password: hashedPassword, role: 'admin', name: 'System Administrator' },
      // Faculty members - each assigned to one course
      { email: 'faculty.cs@test.com', password: hashedPassword, role: 'faculty', name: 'Dr. John Smith', assignedCourse: 'CS101' },
      { email: 'faculty.ma@test.com', password: hashedPassword, role: 'faculty', name: 'Dr. Sarah Johnson', assignedCourse: 'MA102' },
      { email: 'faculty.ec@test.com', password: hashedPassword, role: 'faculty', name: 'Dr. Mike Wilson', assignedCourse: 'EC201' },
      { email: 'faculty.ph@test.com', password: hashedPassword, role: 'faculty', name: 'Dr. Emily Davis', assignedCourse: 'PH301' },
      { email: 'faculty.ch@test.com', password: hashedPassword, role: 'faculty', name: 'Dr. Robert Brown', assignedCourse: 'CH401' },
      { email: 'faculty.en@test.com', password: hashedPassword, role: 'faculty', name: 'Dr. Lisa Garcia', assignedCourse: 'EN501' },
      // Students
      { email: 'student1@test.com', password: hashedPassword, role: 'student', name: 'Alice Johnson' },
      { email: 'student2@test.com', password: hashedPassword, role: 'student', name: 'Bob Wilson' },
      { email: 'student3@test.com', password: hashedPassword, role: 'student', name: 'Carol Davis' },
      { email: 'student4@test.com', password: hashedPassword, role: 'student', name: 'David Brown' },
      { email: 'student5@test.com', password: hashedPassword, role: 'student', name: 'Eva Garcia' }
    ];

    await User.insertMany(users);
    console.log('Users created');

    // Create sample marks
    const sampleMarks = [
      // Student 1 - All subjects
      { studentEmail: 'student1@test.com', courseCode: 'CS101', marks: 85 },
      { studentEmail: 'student1@test.com', courseCode: 'MA102', marks: 78 },
      { studentEmail: 'student1@test.com', courseCode: 'EC201', marks: 92 },
      { studentEmail: 'student1@test.com', courseCode: 'PH301', marks: 88 },
      { studentEmail: 'student1@test.com', courseCode: 'CH401', marks: 76 },
      { studentEmail: 'student1@test.com', courseCode: 'EN501', marks: 91 },
      // Student 2 - All subjects
      { studentEmail: 'student2@test.com', courseCode: 'CS101', marks: 76 },
      { studentEmail: 'student2@test.com', courseCode: 'MA102', marks: 82 },
      { studentEmail: 'student2@test.com', courseCode: 'EC201', marks: 79 },
      { studentEmail: 'student2@test.com', courseCode: 'PH301', marks: 84 },
      { studentEmail: 'student2@test.com', courseCode: 'CH401', marks: 87 },
      { studentEmail: 'student2@test.com', courseCode: 'EN501', marks: 73 },
      // Student 3 - All subjects
      { studentEmail: 'student3@test.com', courseCode: 'CS101', marks: 94 },
      { studentEmail: 'student3@test.com', courseCode: 'MA102', marks: 89 },
      { studentEmail: 'student3@test.com', courseCode: 'EC201', marks: 88 },
      { studentEmail: 'student3@test.com', courseCode: 'PH301', marks: 91 },
      { studentEmail: 'student3@test.com', courseCode: 'CH401', marks: 85 },
      { studentEmail: 'student3@test.com', courseCode: 'EN501', marks: 93 },
      // Student 4 - All subjects
      { studentEmail: 'student4@test.com', courseCode: 'CS101', marks: 67 },
      { studentEmail: 'student4@test.com', courseCode: 'MA102', marks: 73 },
      { studentEmail: 'student4@test.com', courseCode: 'EC201', marks: 71 },
      { studentEmail: 'student4@test.com', courseCode: 'PH301', marks: 85 },
      { studentEmail: 'student4@test.com', courseCode: 'CH401', marks: 78 },
      { studentEmail: 'student4@test.com', courseCode: 'EN501', marks: 82 },
      // Student 5 - All subjects
      { studentEmail: 'student5@test.com', courseCode: 'CS101', marks: 81 },
      { studentEmail: 'student5@test.com', courseCode: 'MA102', marks: 75 },
      { studentEmail: 'student5@test.com', courseCode: 'EC201', marks: 83 },
      { studentEmail: 'student5@test.com', courseCode: 'PH301', marks: 79 },
      { studentEmail: 'student5@test.com', courseCode: 'CH401', marks: 87 },
      { studentEmail: 'student5@test.com', courseCode: 'EN501', marks: 90 }
    ];

    await Marks.insertMany(sampleMarks);
    console.log('Sample marks created');

    // Create sample comments
    const sampleComments = [
      { studentEmail: 'student1@test.com', courseCode: 'CS101', facultyEmail: 'faculty.cs@test.com', comment: 'Good understanding of programming concepts. Keep practicing algorithms.' },
      { studentEmail: 'student2@test.com', courseCode: 'CS101', facultyEmail: 'faculty.cs@test.com', comment: 'Need to improve debugging skills. Focus on code optimization.' },
      { studentEmail: 'student3@test.com', courseCode: 'CS101', facultyEmail: 'faculty.cs@test.com', comment: 'Excellent work! Strong problem-solving abilities.' },
      { studentEmail: 'student1@test.com', courseCode: 'MA102', facultyEmail: 'faculty.ma@test.com', comment: 'Good progress in calculus. Practice more integration problems.' },
      { studentEmail: 'student2@test.com', courseCode: 'MA102', facultyEmail: 'faculty.ma@test.com', comment: 'Strong analytical skills. Keep up the good work!' }
    ];

    await Comment.insertMany(sampleComments);
    console.log('Sample comments created');

    console.log('\n=== SEED DATA COMPLETE ===');
    console.log('Admin Login: admin@test.com / password123');
    console.log('\nFaculty Login credentials:');
    console.log('CS101: faculty.cs@test.com / password123');
    console.log('MA102: faculty.ma@test.com / password123');
    console.log('EC201: faculty.ec@test.com / password123');
    console.log('PH301: faculty.ph@test.com / password123');
    console.log('CH401: faculty.ch@test.com / password123');
    console.log('EN501: faculty.en@test.com / password123');
    console.log('\nStudent Login credentials:');
    console.log('student1@test.com / password123');
    console.log('student2@test.com / password123');
    console.log('student3@test.com / password123');
    console.log('student4@test.com / password123');
    console.log('student5@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
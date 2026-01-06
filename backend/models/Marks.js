const mongoose = require("mongoose");

// Function to calculate grade based on marks
function calculateGrade(marks) {
  if (marks >= 90) return 'S';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
}

const marksSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['CS101', 'MA102', 'EC201', 'PH301', 'CH401', 'EN501']
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['S', 'A', 'B', 'C', 'D', 'F']
  }
}, {
  timestamps: true
});

// Auto-calculate grade before saving
marksSchema.pre('save', function(next) {
  this.grade = calculateGrade(this.marks);
  next();
});

// Auto-calculate grade before updating
marksSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.marks !== undefined) {
    update.grade = calculateGrade(update.marks);
  }
  next();
});

// Compound index to prevent duplicate entries
marksSchema.index({ studentEmail: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);

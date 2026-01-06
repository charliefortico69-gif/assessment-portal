const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    enum: ['CS101', 'MA102', 'EC201', 'PH301', 'CH401', 'EN501'] // Six specific courses
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  credits: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);

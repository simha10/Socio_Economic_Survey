const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  surveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slum',
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  },
  slumSurveyStatus: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'NOT_STARTED'
  },
  householdSurveyProgress: {
    completed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
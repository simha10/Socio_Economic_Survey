const mongoose = require('mongoose');

const slumSchema = new mongoose.Schema({
  slumId: {
    type: Number,
    required: [true, 'Slum ID is required'],
    unique: true
  },
  slumName: {
    type: String,
    required: [true, 'Slum name is required'],
    trim: true
  },
  stateCode: {
    type: String,
    required: [true, 'State code is required'],
    trim: true
  },
  distCode: {
    type: String,
    required: [true, 'District code is required'],
    trim: true
  },
  ulbCode: {
    type: String,
    required: [true, 'ULB code is required'],
    trim: true
  },
  ulbName: {
    type: String,
    required: [true, 'ULB name is required'],
    trim: true
  },
  cityTownCode: {
    type: String,
    required: [true, 'City/Town code is required'],
    trim: true
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward',
    required: [true, 'Ward is required']
  },
  slumType: {
    type: String,
    enum: ['NOTIFIED', 'NON_NOTIFIED', 'NEW_IDENTIFIED'],
    required: true
  },
  village: {
    type: String,
    trim: true,
    default: ''
  },
  area: {
    type: Number,
    min: 0,
    default: 0
  },
  landOwnership: {
    type: String,
    trim: true,
    default: ''
  },
  totalHouseholds: {
    type: Number,
    min: 0,
    default: 0
  },
  surveyStatus: {
    type: String,
    enum: ['DRAFT', 'IN PROGRESS', 'COMPLETED'],
    default: 'DRAFT'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Slum', slumSchema);
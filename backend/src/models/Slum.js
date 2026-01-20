const mongoose = require('mongoose');

const slumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Slum name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  ward: {
    type: String,
    required: [true, 'Ward is required'],
    trim: true
  },
  slumType: {
    type: String,
    enum: ['NOTIFIED', 'NON_NOTIFIED'],
    required: true
  },
  landOwnership: {
    type: String,
    required: [true, 'Land ownership is required'],
    trim: true
  },
  totalHouseholds: {
    type: Number,
    min: 0
  },
  surveyStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED'],
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
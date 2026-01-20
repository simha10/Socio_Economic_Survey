const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema({
  slum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slum',
    required: true
  },
  doorNo: {
    type: String,
    required: [true, 'Door number is required'],
    trim: true
  },
  headName: {
    type: String,
    required: [true, 'Head of family name is required'],
    trim: true
  },
  surveyor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  surveyStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED'],
    default: 'DRAFT'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Household', householdSchema);
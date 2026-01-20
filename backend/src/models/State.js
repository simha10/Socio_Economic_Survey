const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'State name is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  code: {
    type: String,
    required: [true, 'State code is required'],
    unique: true,
    uppercase: true
  },
  districts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('State', stateSchema);
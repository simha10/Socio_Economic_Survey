const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'District is required']
  },
  zone: {
    type: String,
    required: [true, 'Zone Number is required'],
    trim: true,
    uppercase: true
  },
  number: {
    type: String,
    required: [true, 'Ward number is required'],
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Ward name is required'],
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Ensure unique combination of ward number and district number
wardSchema.index({ number: 1, district: 1 }, { unique: true });

module.exports = mongoose.model('Ward', wardSchema);

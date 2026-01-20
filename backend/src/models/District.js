const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'District name is required'],
    trim: true,
    uppercase: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique combination of district name and state
districtSchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model('District', districtSchema);
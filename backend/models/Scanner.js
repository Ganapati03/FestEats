const mongoose = require('mongoose');

const scannerSchema = new mongoose.Schema({
  image: { type: String, required: true }, // Path to the uploaded scanner image
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who uploaded
  isActive: { type: Boolean, default: true }, // Whether this scanner is currently active for students
  description: { type: String }, // Optional description
}, { timestamps: true });

module.exports = mongoose.model('Scanner', scannerSchema);

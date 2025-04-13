const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  machineName: { type: String, required: true },
  machineType: { type: String },
  manufacturer: { type: String },
  model: { type: String },
  serialNumber: { type: String },
  installationDate: { type: Date },
  notes: { type: String },
  status: { type: String, default: 'operational' },
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);

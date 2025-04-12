const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  machineName: String,
  machineId: String,
  machineType: String,
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  notes: String,
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'offline'],
    default: 'operational',
  },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
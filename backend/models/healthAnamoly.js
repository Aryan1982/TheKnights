const mongoose = require('mongoose');

const HealthAnomalySchema = new mongoose.Schema({
  UDI: String,
  product_id: String, // Optional, may not exist in welding
  machineId: String,
  machineType: String, // 'cnc' or 'welding'
  type: String,
  air_temperature: Number,
  process_temperature: Number,
  vibration_rms: Number,
  temperature: Number,
  pressure: Number,
  rotational_speed: Number,
  torque: Number,
  current: Number,
  pressure_psi: Number,
flow_rate_gpm: Number,
temperature_celsius: Number,
vibration_mm_s: Number,
power_consumption_kw: Number,
noise_level_db: Number,
oil_viscosity: Number,
  tool_wear: Number,
  Health:Number,
  Status: String,
  Diagnosis: String,
  timestamp: Date,
});

module.exports = mongoose.model('HealthAnomaly', HealthAnomalySchema);

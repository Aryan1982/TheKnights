const mongoose = require('mongoose');

const HealthAnomalySchema = new mongoose.Schema({
  UDI: String,
  product_id: String,
  type: String,
  air_temperature: Number,
  process_temperature: Number,
  rotational_speed: Number,
  torque: Number,
  tool_wear: Number,
  prediction: Number,
  timestamp: Date,
});

module.exports = mongoose.model('HealthAnomaly', HealthAnomalySchema);

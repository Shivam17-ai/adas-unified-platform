const mongoose = require('mongoose');

const adasSchema = new mongoose.Schema({
  FL: Number,
  FR: Number,
  BL: Number,
  BR: Number,
  Danger: Number,
  Front_Avg: Number,
  Min_Dist: Number,
  Rel_Speed: Number,
  Acceleration: Number,
  TTC_Seconds: Number,
  Steering_Angle: Number,
  Status_Label: String,
  Safety_Pct: Number,
  False_Positive_Pct: Number,
  Steering_Display: String,
  Aggression_Score: Number,
  Threat_Source: String
});

module.exports = mongoose.model('AdasData', adasSchema);
const mongoose = require('mongoose')

const healthScanSchema = new mongoose.Schema(
  {
    animalId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true, index: true },
    scanType:  { type: String, required: true },
    location:  { type: String, default: '' },
    status:    { type: String, enum: ['healthy', 'warning', 'critical'], required: true },
    condition: { type: String, required: true },
    finding:   { type: String, required: true },
    severity:  { type: Number, min: 0, max: 10, default: 0 },
    recommendations: [String],
    food: {
      remove: [String],
      add:    [String],
    },
    urgency:    { type: String, enum: ['monitor', 'vet_soon', 'vet_now'], default: 'monitor' },
    prevention: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('HealthScan', healthScanSchema)

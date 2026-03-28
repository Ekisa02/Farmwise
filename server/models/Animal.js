const mongoose = require('mongoose')

const animalSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    type:   { type: String, enum: ['cow', 'bull', 'calf'], required: true },
    breed:  { type: String, required: true },
    age:    { type: String, required: true },   // e.g. "4 yrs" or "3 mos"
    sex:    { type: String, enum: ['M', 'F'],  required: true },
    emoji:  { type: String, default: '🐄' },
    status: { type: String, enum: ['healthy', 'warning', 'critical'], default: 'healthy' },
    notes:  { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Animal', animalSchema)

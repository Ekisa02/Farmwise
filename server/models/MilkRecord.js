const mongoose = require('mongoose')

const milkSchema = new mongoose.Schema(
  {
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true, index: true },
    date:     { type: String,  required: true },   // ISO date string "YYYY-MM-DD"
    am:       { type: Number,  required: true, min: 0 },
    pm:       { type: Number,  required: true, min: 0 },
  },
  { timestamps: true }
)

// One record per animal per day
milkSchema.index({ animalId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('MilkRecord', milkSchema)

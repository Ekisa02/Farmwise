const express = require('express')
const router  = express.Router()
const Animal  = require('../models/Animal')

// GET all animals
router.get('/', async (_req, res) => {
  try {
    const animals = await Animal.find().sort({ type: 1, name: 1 })
    res.json(animals)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET single animal
router.get('/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id)
    if (!animal) return res.status(404).json({ message: 'Animal not found' })
    res.json(animal)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create animal
router.post('/', async (req, res) => {
  try {
    const animal = new Animal(req.body)
    const saved  = await animal.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT update animal
router.put('/:id', async (req, res) => {
  try {
    const updated = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ message: 'Animal not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE animal
router.delete('/:id', async (req, res) => {
  try {
    await Animal.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

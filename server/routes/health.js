const express    = require('express')
const router     = express.Router()
const multer     = require('multer')
const Anthropic  = require('@anthropic-ai/sdk')
const Animal     = require('../models/Animal')
const HealthScan = require('../models/HealthScan')

const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/health/scan  — analyse image
router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    const { animalId, scanType, location } = req.body
    const file = req.file

    if (!file)     return res.status(400).json({ message: 'No image uploaded' })
    if (!animalId) return res.status(400).json({ message: 'animalId required' })

    const animal = await Animal.findById(animalId)
    if (!animal)   return res.status(404).json({ message: 'Animal not found' })

    const base64     = file.buffer.toString('base64')
    const mediaType  = file.mimetype

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are a fast expert livestock vet AI for Kenyan smallholder farmers near ${location || 'Kenya'}.
Analyse photos quickly and accurately.
Return ONLY valid JSON with this exact schema (no markdown, no extra text):
{
  "status": "healthy|warning|critical",
  "condition": "disease name or Normal",
  "finding": "1-2 plain English sentences",
  "severity": 0,
  "recommendations": ["action 1", "action 2", "action 3"],
  "food": { "remove": ["item"], "add": ["item with amount"] },
  "urgency": "monitor|vet_soon|vet_now",
  "prevention": "one prevention tip"
}`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `${scanType} photo of ${animal.type} "${animal.name}" — ${animal.breed}, ${animal.age}, ${animal.sex === 'M' ? 'male' : 'female'}. Location: ${location || 'Kenya'}. Give a fast, accurate health assessment.`,
            },
          ],
        },
      ],
    })

    const raw    = message.content.map(c => c.text || '').join('')
    const clean  = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    // Persist scan to DB
    const scan = await HealthScan.create({
      animalId,
      scanType,
      location: location || '',
      ...result,
    })

    // If critical/warning, update animal status
    if (result.status !== 'healthy') {
      await Animal.findByIdAndUpdate(animalId, { status: result.status })
    }

    res.json({ ...result, _id: scan._id })
  } catch (err) {
    console.error('Health scan error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/health/history/:animalId
router.get('/history/:animalId', async (req, res) => {
  try {
    const scans = await HealthScan
      .find({ animalId: req.params.animalId })
      .sort({ createdAt: -1 })
      .limit(20)
    res.json(scans)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/health/recent — latest scan per animal across herd
router.get('/recent', async (req, res) => {
  try {
    const scans = await HealthScan.find().sort({ createdAt: -1 }).limit(20).populate('animalId', 'name breed emoji')
    res.json(scans)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

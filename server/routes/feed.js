const express   = require('express')
const router    = express.Router()
const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/feed/advice
router.post('/advice', async (req, res) => {
  const { concern, foods = [] } = req.body
  if (!concern) return res.status(400).json({ message: 'concern is required' })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are a livestock nutrition expert for Kenyan smallholder dairy farmers.
Give practical, locally-relevant feeding advice.
Return ONLY valid JSON with this exact schema (no markdown):
{
  "summary": "one sentence summary",
  "remove": [{ "food": "name", "reason": "why" }],
  "add": [{ "food": "name", "amount": "how much per day", "reason": "why" }],
  "water": "daily water intake tip",
  "local_tip": "one Kenya-specific farming tip"
}`,
      messages: [
        {
          role: 'user',
          content: `Cow concern: "${concern}". Available feeds on the farm: ${foods.join(', ')}. Give specific feeding advice for a Kenyan dairy farmer.`,
        },
      ],
    })

    const raw    = message.content.map(c => c.text || '').join('')
    const clean  = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    res.json(result)
  } catch (err) {
    console.error('Feed advice error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router

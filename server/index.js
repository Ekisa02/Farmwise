const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express   = require('express')
const cors      = require('cors')
const mongoose  = require('mongoose')

const animalsRouter = require('./routes/animals')
const milkRouter    = require('./routes/milk')
const healthRouter  = require('./routes/health')
const feedRouter    = require('./routes/feed')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use('/api/animals', animalsRouter)
app.use('/api/milk',    milkRouter)
app.use('/api/health',  healthRouter)
app.use('/api/feed',    feedRouter)

app.get('/api/ping', (_req, res) => res.json({ ok: true, time: new Date() }))

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmwise')
  .then(() => {
    console.log('✅  MongoDB connected')
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message)
    process.exit(1)
  })
/**
 * seed.js — run once to populate the database with the starter herd.
 * Usage (from project root):  node server/seed.js
 * Usage (from server/ folder): node seed.js
 */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const mongoose = require('mongoose')
const Animal   = require('./models/Animal')

const ANIMALS = [
  { name:'Daisy',   type:'cow',  breed:'Friesian',       age:'4 yrs', sex:'F', emoji:'🐄', status:'healthy' },
  { name:'Bessie',  type:'cow',  breed:'Ayrshire',       age:'6 yrs', sex:'F', emoji:'🐄', status:'healthy' },
  { name:'Rosie',   type:'cow',  breed:'Jersey',         age:'3 yrs', sex:'F', emoji:'🐄', status:'warning' },
  { name:'Lulu',    type:'cow',  breed:'Guernsey',       age:'5 yrs', sex:'F', emoji:'🐄', status:'healthy' },
  { name:'Naomi',   type:'cow',  breed:'Sahiwal',        age:'4 yrs', sex:'F', emoji:'🐄', status:'healthy' },
  { name:'Grace',   type:'cow',  breed:'Zebu',           age:'7 yrs', sex:'F', emoji:'🐄', status:'healthy' },
  { name:'Hilda',   type:'cow',  breed:'Brown Swiss',    age:'3 yrs', sex:'F', emoji:'🐄', status:'healthy' },
  { name:'Titan',   type:'bull', breed:'Friesian',       age:'5 yrs', sex:'M', emoji:'🐂', status:'healthy' },
  { name:'Goliath', type:'bull', breed:'Boran',          age:'4 yrs', sex:'M', emoji:'🐂', status:'healthy' },
  { name:'Rex',     type:'bull', breed:'Angus cross',    age:'3 yrs', sex:'M', emoji:'🐂', status:'healthy' },
  { name:'Tiny',    type:'calf', breed:'Friesian cross', age:'3 mos', sex:'F', emoji:'🐮', status:'healthy' },
  { name:'Bingo',   type:'calf', breed:'Ayrshire cross', age:'5 mos', sex:'M', emoji:'🐮', status:'healthy' },
  { name:'Stella',  type:'calf', breed:'Jersey cross',   age:'2 mos', sex:'F', emoji:'🐮', status:'warning' },
  { name:'Kibo',    type:'calf', breed:'Sahiwal cross',  age:'1 mo',  sex:'M', emoji:'🐮', status:'healthy' },
]

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmwise'
  console.log('Connecting to:', uri)
  await mongoose.connect(uri)
  console.log('✅  Connected to MongoDB')

  await Animal.deleteMany({})
  console.log('🗑   Cleared existing animals')

  const created = await Animal.insertMany(ANIMALS)
  console.log(`✅  Seeded ${created.length} animals`)

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error('❌', err.message); process.exit(1) })
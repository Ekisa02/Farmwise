/**
 * db.js
 * IndexedDB offline cache using the `idb` library.
 * When the device is offline, reads/writes go here.
 * When back online, pending writes sync to the server.
 */

import { openDB } from 'idb'

const DB_NAME    = 'farmwise'
const DB_VERSION = 1

let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Animals cache
      if (!db.objectStoreNames.contains('animals')) {
        db.createObjectStore('animals', { keyPath: '_id' })
      }
      // Milk records
      if (!db.objectStoreNames.contains('milkRecords')) {
        const ms = db.createObjectStore('milkRecords', { keyPath: 'localId', autoIncrement: true })
        ms.createIndex('animalId', 'animalId')
      }
      // Pending sync queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
      // Health scan log
      if (!db.objectStoreNames.contains('scans')) {
        const ss = db.createObjectStore('scans', { keyPath: 'localId', autoIncrement: true })
        ss.createIndex('animalId', 'animalId')
      }
    }
  })
  return _db
}

// ── Animals ────────────────────────────────────────────────
export async function cacheAnimals(animals) {
  const db = await getDB()
  const tx = db.transaction('animals', 'readwrite')
  await Promise.all(animals.map(a => tx.store.put(a)))
  await tx.done
}

export async function getCachedAnimals() {
  const db = await getDB()
  return db.getAll('animals')
}

// ── Milk Records ───────────────────────────────────────────
export async function saveMilkOffline(record) {
  // record: { animalId, date, am, pm, synced: false }
  const db = await getDB()
  const id = await db.add('milkRecords', { ...record, synced: false })
  await db.add('syncQueue', { type: 'milk', payload: { ...record }, createdAt: Date.now() })
  return id
}

export async function getMilkForAnimal(animalId) {
  const db = await getDB()
  return db.getAllFromIndex('milkRecords', 'animalId', animalId)
}

// ── Sync Queue ─────────────────────────────────────────────
export async function getPendingSync() {
  const db = await getDB()
  return db.getAll('syncQueue')
}

export async function clearSyncItem(id) {
  const db = await getDB()
  return db.delete('syncQueue', id)
}

// ── Scan log ───────────────────────────────────────────────
export async function saveScanLocal(scan) {
  const db = await getDB()
  return db.add('scans', { ...scan, savedAt: Date.now() })
}

export async function getRecentScans(limit = 10) {
  const db = await getDB()
  const all = await db.getAll('scans')
  return all.sort((a, b) => b.savedAt - a.savedAt).slice(0, limit)
}

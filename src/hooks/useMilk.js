import { useState, useCallback } from 'react'
import { milkApi } from '../services/api'
import { saveMilkOffline, getMilkForAnimal, getPendingSync, clearSyncItem } from '../services/db'

export function useMilk() {
  const [records, setRecords] = useState({})   // { animalId: [...] }
  const [pending, setPending] = useState(0)

  const loadForAnimal = useCallback(async (animalId) => {
    try {
      const data = await milkApi.getLast7(animalId)
      setRecords(prev => ({ ...prev, [animalId]: data }))
    } catch {
      // offline → read IndexedDB
      const cached = await getMilkForAnimal(animalId)
      setRecords(prev => ({ ...prev, [animalId]: cached }))
    }
  }, [])

  const saveRecord = useCallback(async (animalId, date, am, pm, isOnline) => {
    const entry = { animalId, date, am, pm }
    if (isOnline) {
      try {
        const saved = await milkApi.save(entry)
        setRecords(prev => {
          const existing = (prev[animalId] || []).filter(r => r.date !== date)
          return { ...prev, [animalId]: [...existing, saved].sort((a,b)=>a.date.localeCompare(b.date)) }
        })
        return saved
      } catch {
        // fall through to offline save
      }
    }
    // Offline save
    await saveMilkOffline(entry)
    setRecords(prev => {
      const existing = (prev[animalId] || []).filter(r => r.date !== date)
      return { ...prev, [animalId]: [...existing, { ...entry, _offline: true }].sort((a,b)=>a.date.localeCompare(b.date)) }
    })
    setPending(p => p + 1)
  }, [])

  const syncPending = useCallback(async () => {
    const queue = await getPendingSync()
    let synced = 0
    for (const item of queue) {
      try {
        await milkApi.save(item.payload)
        await clearSyncItem(item.id)
        synced++
      } catch {
        break   // stop on first failure (still offline)
      }
    }
    setPending(p => Math.max(0, p - synced))
  }, [])

  return { records, pending, loadForAnimal, saveRecord, syncPending }
}

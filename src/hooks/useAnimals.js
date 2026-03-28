import { useState, useEffect } from 'react'
import { animalsApi } from '../services/api'
import { cacheAnimals, getCachedAnimals } from '../services/db'

export function useAnimals() {
  const [animals, setAnimals]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await animalsApi.getAll()
      setAnimals(data)
      await cacheAnimals(data)          // keep offline cache fresh
    } catch (err) {
      // Offline or server error → fall back to IndexedDB cache
      const cached = await getCachedAnimals()
      if (cached.length) {
        setAnimals(cached)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const addAnimal = async (data) => {
    const created = await animalsApi.create(data)
    setAnimals(prev => [...prev, created])
    return created
  }

  const updateAnimal = async (id, data) => {
    const updated = await animalsApi.update(id, data)
    setAnimals(prev => prev.map(a => a._id === id ? updated : a))
    return updated
  }

  const removeAnimal = async (id) => {
    await animalsApi.remove(id)
    setAnimals(prev => prev.filter(a => a._id !== id))
  }

  return { animals, loading, error, reload: load, addAnimal, updateAnimal, removeAnimal }
}

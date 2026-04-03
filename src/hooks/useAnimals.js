import { useState, useEffect } from 'react'
import { animalsApi } from '../services/api'
import { cacheAnimals, getCachedAnimals } from '../services/db'

// `enabled` = false until user is logged in (avoids 401 on mount)
export function useAnimals(enabled = true) {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const data = await animalsApi.getAll()
      setAnimals(data)
      await cacheAnimals(data)
    } catch (err) {
      const cached = await getCachedAnimals()
      if (cached.length) setAnimals(cached)
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (enabled) load()
    else setLoading(false)
  }, [enabled])

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

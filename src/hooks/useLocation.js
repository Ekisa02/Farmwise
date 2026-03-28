import { useState, useEffect } from 'react'

export function useLocation() {
  const [loc, setLoc] = useState({ label: 'Detecting location…', lat: null, lng: null })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoc({ label: 'Nairobi, Nairobi County, KE', lat: -1.2921, lng: 36.8219 })
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          )
          const d = await r.json()
          const parts = [
            d.address?.suburb || d.address?.neighbourhood || d.address?.village || '',
            d.address?.city   || d.address?.town          || d.address?.county  || '',
            'KE',
          ].filter(Boolean)
          setLoc({ label: parts.join(', '), lat, lng })
        } catch {
          setLoc({ label: `${lat.toFixed(3)}°S, ${Math.abs(lng).toFixed(3)}°E`, lat, lng })
        }
      },
      () => setLoc({ label: 'Nairobi, Nairobi County, KE', lat: -1.2921, lng: 36.8219 }),
      { timeout: 7000 }
    )
  }, [])

  return loc
}

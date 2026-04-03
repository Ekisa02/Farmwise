import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // checking stored token

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('fw_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(u  => setUser(u))
      .catch(() => localStorage.removeItem('fw_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('fw_token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password, farm) => {
    const data = await authApi.register({ name, email, password, farm })
    localStorage.setItem('fw_token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('fw_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

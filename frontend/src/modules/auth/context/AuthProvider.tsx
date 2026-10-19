import { useEffect, useState, type ReactNode } from 'react'
import {
  loginRequest,
  logoutRequest,
  refreshSession,
  setAccessToken,
  type AuthUser,
} from '../../../shared/api/client'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshSession()
      .then((data) => setUser(data.user))
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const data = await loginRequest(username, password)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

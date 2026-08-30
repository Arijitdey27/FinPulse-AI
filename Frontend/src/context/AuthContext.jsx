import { createContext, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'finpulse_token'
const USER_KEY = 'finpulse_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const persistSession = (payload) => {
    const nextToken = payload.accessToken
    const nextUser = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      tenantName: payload.tenantName,
      expiresAt: payload.expiresAt,
    }

    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  const login = async (credentials) => {
    setIsLoading(true)

    try {
      const { data } = await api.post('/auth/login', credentials)
      persistSession(data)
      return { ok: true, data }
    } catch (error) {
      const status = error.response?.status

      return {
        ok: false,
        message:
          (status && status >= 500 && 'Login service is unavailable right now. Please make sure the backend container is running.') ||
          (!error.response && 'Unable to reach the login service. Please check that Docker and the backend are running on port 8082.') ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Authentication failed. Please verify your credentials.',
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ff_user')) } catch { return null }
  })

  const login  = (u) => { setUser(u); localStorage.setItem('ff_user', JSON.stringify(u)) }
  const logout = ()  => { setUser(null); localStorage.removeItem('ff_user') }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }

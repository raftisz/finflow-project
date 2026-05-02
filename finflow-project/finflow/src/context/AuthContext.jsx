import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext(null)

const KEY = 'ff_user'
const load  = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }
const save  = (u) => localStorage.setItem(KEY, JSON.stringify(u))
const clear = ()  => localStorage.removeItem(KEY)

export function AuthProvider({ children }) {
  // Initialise from localStorage → auto-login on refresh
  const [user, setUser] = useState(() => load())

  const login  = (u) => { setUser(u); save(u) }
  const logout = ()  => { setUser(null); clear() }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }

import { createContext, useState, useContext, useEffect } from 'react'
import { loginUser } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])

  // Simular carregamento do usuário do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('oceanos_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const register = async (userData) => {
    try {
      // Registrar no backend
      const backendUser = await loginUser({
        username: userData.username,
        name: userData.name,
        phone: userData.phone,
        city: userData.city,
        country: userData.country,
        language: userData.language,
      })
      
      const newUser = {
        ...backendUser,
        phone: userData.phone,
        city: userData.city,
        country: userData.country,
        language: userData.language,
        createdAt: backendUser.created_at || new Date().toISOString(),
        followers: 0,
        statusCount: 0,
        messagesCount: 0,
      }
      
      setUser(newUser)
      localStorage.setItem('oceanos_user', JSON.stringify(newUser))
      return newUser
    } catch (error) {
      console.error('Erro ao registrar:', error)
      // Fallback local
      const newUser = {
        id: Date.now(),
        ...userData,
        phone: userData.phone,
        city: userData.city,
        country: userData.country,
        language: userData.language,
        createdAt: new Date().toISOString(),
        followers: 0,
        statusCount: 0,
        messagesCount: 0,
      }
      setUser(newUser)
      localStorage.setItem('oceanos_user', JSON.stringify(newUser))
      return newUser
    }
  }

  const login = async (email, password) => {
    try {
      // Login no backend
      const username = email.split('@')[0]
      const backendUser = await loginUser({
        username,
        name: username
      })
      
      const user = {
        ...backendUser,
        followers: 0,
        statusCount: 0,
        messagesCount: 0,
      }
      
      setUser(user)
      localStorage.setItem('oceanos_user', JSON.stringify(user))
      return user
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      // Fallback local
      const user = {
        id: Date.now(),
        email,
        name: email.split('@')[0],
        username: email.split('@')[0],
        bio: '',
        city: '',
        country: '',
        profileImage: '',
        followers: 0,
        statusCount: 0,
        messagesCount: 0,
      }
      setUser(user)
      localStorage.setItem('oceanos_user', JSON.stringify(user))
      return user
    }
  }

  const logout = () => {
    setUser(null)
    setContacts([])
    setGroups([])
    localStorage.removeItem('oceanos_user')
  }

  const addContact = (contact) => {
    if (!contacts.find(c => c.id === contact.id)) {
      setContacts([...contacts, contact])
    }
  }

  const removeContact = (contactId) => {
    setContacts(contacts.filter(c => c.id !== contactId))
  }

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('oceanos_user', JSON.stringify(updated))
    return updated
  }

  const value = {
    user,
    loading,
    contacts,
    groups,
    register,
    login,
    logout,
    addContact,
    removeContact,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

import { createContext, useState, useContext, useEffect } from 'react'

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

  const register = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
      followers: 0,
      statusCount: 0,
      messagesCount: 0,
    }
    setUser(newUser)
    localStorage.setItem('oceanos_user', JSON.stringify(newUser))
    return newUser
  }

  const login = (email, password) => {
    // Simular login (em produção seria feito no backend)
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

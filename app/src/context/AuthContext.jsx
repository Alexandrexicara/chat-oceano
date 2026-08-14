import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { loginUser, updateUserProfile, getContacts } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('oceanos_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('oceanos_user')
      }
    }
    setLoading(false)
  }, [])

  // Recarregar contatos do banco sempre que o usuário mudar
  const refreshContacts = useCallback(async (userId) => {
    if (!userId) return
    try {
      const list = await getContacts(userId)
      setContacts(list || [])
    } catch (err) {
      console.error('Erro ao carregar contatos:', err)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      refreshContacts(user.id)
    }
  }, [user?.id, refreshContacts])

  const register = async (userData) => {
    try {
      const backendUser = await loginUser({
        username: userData.username,
        name: userData.name,
        phone: userData.phone,
        city: userData.city,
        country: userData.country,
        language: userData.language,
        inviter_id: userData.inviter_id,
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
      // Fallback local se o banco estiver indisponível
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
  }

  const login = async (email, password) => {
    try {
      const username = email.includes('@') ? email.split('@')[0] : email
      const backendUser = await loginUser({ username, name: username })

      const loggedUser = {
        ...backendUser,
        followers: 0,
        statusCount: 0,
        messagesCount: 0,
      }

      setUser(loggedUser)
      localStorage.setItem('oceanos_user', JSON.stringify(loggedUser))
      return loggedUser
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      const fallback = {
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
      setUser(fallback)
      localStorage.setItem('oceanos_user', JSON.stringify(fallback))
      return fallback
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
      setContacts(prev => [...prev, contact])
    }
  }

  const removeContact = (contactId) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
  }

  const updateProfile = async (updates) => {
    try {
      let updated = { ...user, ...updates }

      if (user?.username) {
        const serverUser = await updateUserProfile(user.username, updates)
        updated = { ...user, ...serverUser }
      }

      setUser(updated)
      localStorage.setItem('oceanos_user', JSON.stringify(updated))
      return updated
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      // Fallback local
      const updated = { ...user, ...updates }
      setUser(updated)
      localStorage.setItem('oceanos_user', JSON.stringify(updated))
      return updated
    }
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
    refreshContacts,
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

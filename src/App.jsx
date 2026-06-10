import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Auth } from './pages/Auth'
import { Chat } from './pages/Chat'
import { Status } from './pages/Status'
import { Profile } from './pages/Profile'
import { Loading } from './components/BaseComponents'
import { theme, globalStyles } from './styles/theme'
import './App.css'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('chat')

  if (loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Auth />
  }

  // Navegação
  const navItems = [
    { id: 'chat', label: '💬 Chat', icon: '💬' },
    { id: 'oceano', label: '🌊 Oceano', icon: '🌊' },
    { id: 'status', label: '🍾 Status', icon: '🍾' },
    { id: 'profile', label: '👤 Perfil', icon: '👤' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Navegação Lateral */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              background: currentPage === item.id ? theme.colors.primary : 'transparent',
              color: theme.colors.text,
              cursor: 'pointer',
              fontSize: theme.fonts.sizes.lg,
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.xs,
            }}
            title={item.label}
          >
            <span>{item.icon}</span>
            <span style={{ fontSize: theme.fonts.sizes.xs }}>{item.id}</span>
          </button>
        ))}
      </nav>

      {/* Conteúdo Principal */}
      <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '60px' }}>
        {currentPage === 'chat' && <Chat />}
        {currentPage === 'oceano' && <Chat oceanoMode />}
        {currentPage === 'status' && <Status />}
        {currentPage === 'profile' && <Profile />}
      </div>

      <style>{globalStyles}</style>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'

export function Status() {
  const { user, logout } = useAuth()
  const [mode, setMode] = useState('view') // view ou create
  const [statusForm, setStatusForm] = useState({ text: '', image: '' })
  const [statuses, setStatuses] = useState([
    {
      id: 1,
      author: 'João Silva',
      avatar: '👤',
      content: 'Que dia lindo! 🌞',
      type: 'text',
      timestamp: '2 minutos atrás',
      views: 15,
    },
    {
      id: 2,
      author: 'Maria Santos',
      avatar: '👩',
      content: 'Viajando para a praia! 🏖️',
      type: 'text',
      timestamp: '1 hora atrás',
      views: 32,
    },
  ])

  const handleCreateStatus = (e) => {
    e.preventDefault()
    if (!statusForm.text.trim()) return

    const newStatus = {
      id: Date.now(),
      author: user.name,
      avatar: '👤',
      content: statusForm.text,
      type: 'text',
      timestamp: 'agora',
      views: 0,
    }

    setStatuses([newStatus, ...statuses])
    setStatusForm({ text: '', image: '' })
    setMode('view')
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background }}>
      <Header>
        <h1 style={{ fontSize: theme.fonts.sizes.xl }}>🌊 Status • Garrafas no Mar</h1>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </Header>

      <Container>
        {mode === 'view' ? (
          <>
            <div style={{ marginBottom: theme.spacing.xl }}>
              <Button
                variant="primary"
                onClick={() => setMode('create')}
                style={{ width: '100%' }}
              >
                ➕ Criar Novo Status
              </Button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: theme.spacing.lg,
              }}
            >
              {statuses.map((status, idx) => (
                <div
                  key={status.id}
                  style={{
                    animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                  }}
                >
                  <Card
                    style={{
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-10px)'
                      e.currentTarget.style.boxShadow = theme.shadows.lg
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = theme.shadows.sm
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: theme.colors.background,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        {status.avatar}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{status.author}</p>
                        <p style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                          {status.timestamp}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        background: theme.colors.background,
                        padding: theme.spacing.lg,
                        borderRadius: theme.borderRadius.md,
                        marginBottom: theme.spacing.md,
                        minHeight: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <p style={{ fontSize: theme.fonts.sizes.lg, textAlign: 'center' }}>
                        🍾 {status.content}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
                      <Badge variant="success">👁️ {status.views}</Badge>
                      <Button
                        variant="secondary"
                        style={{ flex: 1 }}
                      >
                        ❤️ Curtir
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </>
        ) : (
          <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: theme.spacing.lg }}>Criar Novo Status 🍾</h2>

            <form onSubmit={handleCreateStatus}>
              <Input
                label="Seu Status"
                as="textarea"
                value={statusForm.text}
                onChange={e => setStatusForm({ ...statusForm, text: e.target.value })}
                placeholder="Compartilhe um momento..."
                rows={5}
                style={{ fontFamily: theme.fonts.family.base }}
                required
              />

              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 1 }}
                >
                  📤 Publicar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setMode('view')}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
      </Container>
    </div>
  )
}

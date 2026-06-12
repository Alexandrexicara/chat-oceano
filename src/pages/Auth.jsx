import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Container, Card, Button, Input } from '../components/BaseComponents'
import { OceanosTutorial } from '../components/OceanosTutorial'
import { AuthDecorations } from '../components/AuthDecorations'
import { useCDCoin } from '../hooks/useCDCoin'
import { theme } from '../styles/theme'

export function Auth() {
  const [mode, setMode] = useState('login') // login ou register
  const [showTutorial, setShowTutorial] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    phone: '', // Número de telefone para WhatsApp
  })
  const { login, register } = useAuth()
  const { adicionarPontos } = useCDCoin()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'login') {
      login(formData.email, formData.password)
    } else {
      register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone, // Enviar telefone
      }).then(() => {
        // Dar 50 CDCOIN de boas-vindas
        adicionarPontos(50, '🎉 Cadastro realizado!')
      })
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Decorações animadas */}
      <AuthDecorations />

      <Container style={{ maxWidth: '400px', width: '100%', position: 'relative', zIndex: 1 }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
            <h1 style={{ fontSize: theme.fonts.sizes.xxl, marginBottom: theme.spacing.md }}>
              🌊 Oceanos
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Junte-se à nossa comunidade'}
            </p>
            {mode === 'register' && (
              <button
                onClick={() => setShowTutorial(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.secondary,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: theme.fonts.sizes.sm,
                  marginTop: theme.spacing.sm,
                }}
              >
                ❓ Como funciona o Oceanos?
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <Input
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  required
                />
                <Input
                  label="Nome de Usuário"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="seu_usuario"
                  required
                />
                <Input
                  label="Telefone (WhatsApp)"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+55 11 99999-9999"
                  required
                  helperText="Usado para encontrar seus contatos do WhatsApp"
                />
              </>
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginBottom: theme.spacing.md }}
            >
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: theme.spacing.lg }}>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
              {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
            </p>
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.secondary,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: theme.fonts.sizes.md,
              }}
            >
              {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </div>
        </Card>
      </Container>

      {/* Tutorial do Oceanos */}
      {showTutorial && (
        <OceanosTutorial onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}

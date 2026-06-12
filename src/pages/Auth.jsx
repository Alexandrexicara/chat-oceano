import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Container, Card, Button, Input } from '../components/BaseComponents'
import { OceanosTutorial } from '../components/OceanosTutorial'
import { AuthDecorations } from '../components/AuthDecorations'
import { useCDCoin } from '../hooks/useCDCoin'
import { theme } from '../styles/theme'
import { countries, brazilianCities, languages, getDDDByCity } from '../utils/locationData'

export function Auth() {
  const [mode, setMode] = useState('login') // login ou register
  const [showTutorial, setShowTutorial] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    country: 'BR',
    city: '',
    phone: '',
    language: 'pt-BR',
  })
  const { login, register } = useAuth()
  const { adicionarPontos } = useCDCoin()

  const selectedCountry = countries.find(c => c.code === formData.country) || countries[0]
  
  // Se o país for Brasil, mostrar cidades brasileiras
  const showCities = formData.country === 'BR'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      
      // Quando muda o país, atualiza o idioma automaticamente
      if (name === 'country') {
        const country = countries.find(c => c.code === value)
        if (country) {
          updated.language = country.language
          updated.city = '' // Limpa cidade ao mudar de país
          updated.phone = '' // Limpa telefone ao mudar de país
        }
      }
      
      // Quando muda a cidade (Brasil), atualiza o DDD no telefone
      if (name === 'city' && value) {
        const ddd = getDDDByCity(value)
        if (ddd) {
          updated.phone = `(${ddd}) `
        }
      }
      
      return updated
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'login') {
      login(formData.email, formData.password)
    } else {
      // Montar número completo com DDI
      const fullPhone = `+${selectedCountry.ddi} ${formData.phone}`
      
      register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: fullPhone,
        country: formData.country,
        city: formData.city,
        language: formData.language,
      }).then(() => {
        adicionarPontos(50, '🎉 Cadastro realizado!')
      })
    }
  }

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.fonts.sizes.md,
    outline: 'none',
    cursor: 'pointer',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
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
        padding: '20px 0',
      }}
    >
      {/* Decorações animadas */}
      <AuthDecorations />

      <Container style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1 }}>
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

                {/* País */}
                <div style={{ marginBottom: theme.spacing.md }}>
                  <label style={labelStyle}>🌍 País</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} (+{c.ddi})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cidade (só para Brasil) */}
                {showCities && (
                  <div style={{ marginBottom: theme.spacing.md }}>
                    <label style={labelStyle}>🏙️ Cidade</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      style={selectStyle}
                    >
                      <option value="">Selecione sua cidade</option>
                      {brazilianCities.map((c, idx) => (
                        <option key={idx} value={c.name}>
                          {c.name} - {c.state} (DDD {c.ddd})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Telefone com DDI */}
                <div style={{ marginBottom: theme.spacing.md }}>
                  <label style={labelStyle}>📱 WhatsApp</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      padding: '12px 12px',
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      fontSize: theme.fonts.sizes.md,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      {selectedCountry.flag} +{selectedCountry.ddi}
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={showCities && formData.city ? "(11) 99999-9999" : "99999-9999"}
                      required
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.colors.surface,
                        color: theme.colors.text,
                        fontSize: theme.fonts.sizes.md,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <p style={{ 
                    fontSize: theme.fonts.sizes.xs, 
                    color: theme.colors.textSecondary, 
                    marginTop: '4px' 
                  }}>
                    Usado para encontrar seus contatos do WhatsApp
                  </p>
                </div>

                {/* Idioma */}
                <div style={{ marginBottom: theme.spacing.md }}>
                  <label style={labelStyle}>🌐 Idioma</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    {languages.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name}
                      </option>
                    ))}
                  </select>
                  <p style={{ 
                    fontSize: theme.fonts.sizes.xs, 
                    color: theme.colors.textSecondary, 
                    marginTop: '4px' 
                  }}>
                    Idioma detectado: {selectedCountry?.flag} {languages.find(l => l.code === selectedCountry?.language)?.name || 'Português'}
                  </p>
                </div>
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

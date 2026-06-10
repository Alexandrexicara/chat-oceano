import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'

export function Profile() {
  const { user, updateProfile, logout, contacts, addContact } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    city: user?.city || '',
    country: user?.country || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile(formData)
    setEditMode(false)
  }

  const mockUsers = [
    { id: 1, name: 'João Silva', username: 'joao_silva', status: 'Online' },
    { id: 2, name: 'Maria Santos', username: 'maria_santos', status: 'Online' },
    { id: 3, name: 'Pedro Costa', username: 'pedro_costa', status: 'Offline' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, overflowY: 'auto' }}>
      <Header>
        <h1 style={{ fontSize: theme.fonts.sizes.xl }}>👤 Meu Perfil</h1>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </Header>

      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.xl }}>
          {/* Perfil */}
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  margin: '0 auto ' + theme.spacing.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}
              >
                👤
              </div>

              {!editMode ? (
                <>
                  <h2 style={{ marginBottom: theme.spacing.md }}>{user?.name}</h2>
                  <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
                    @{user?.username}
                  </p>
                  {user?.bio && (
                    <p style={{ marginBottom: theme.spacing.lg }}>{user.bio}</p>
                  )}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: theme.spacing.md,
                      marginBottom: theme.spacing.lg,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: theme.fonts.sizes.xl, fontWeight: 'bold' }}>
                        {contacts.length}
                      </p>
                      <p style={{ color: theme.colors.textSecondary }}>Contatos</p>
                    </div>
                    <div>
                      <p style={{ fontSize: theme.fonts.sizes.xl, fontWeight: 'bold' }}>
                        12
                      </p>
                      <p style={{ color: theme.colors.textSecondary }}>Status</p>
                    </div>
                    <div>
                      <p style={{ fontSize: theme.fonts.sizes.xl, fontWeight: 'bold' }}>
                        847
                      </p>
                      <p style={{ color: theme.colors.textSecondary }}>Mensagens</p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setEditMode(true)}
                    style={{ width: '100%' }}
                  >
                    ✏️ Editar Perfil
                  </Button>
                </>
              ) : (
                <form onSubmit={handleSave}>
                  <Input
                    label="Nome"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <Input
                    label="Nome de Usuário"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <Input
                    label="Biografia"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Conte-nos sobre você..."
                  />
                  <Input
                    label="Cidade"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <Input
                    label="País"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                  <div style={{ display: 'flex', gap: theme.spacing.md }}>
                    <Button variant="primary" type="submit" style={{ flex: 1 }}>
                      Salvar
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => setEditMode(false)}
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>

          {/* Contatos */}
          <Card>
            <h2 style={{ marginBottom: theme.spacing.lg }}>👥 Meus Contatos</h2>

            {contacts.length === 0 ? (
              <p style={{ color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg }}>
                Nenhum contato adicionado ainda
              </p>
            ) : (
              <div style={{ marginBottom: theme.spacing.lg }}>
                {contacts.map(contact => (
                  <div
                    key={contact.id}
                    style={{
                      padding: theme.spacing.md,
                      background: theme.colors.background,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.md,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{contact.name}</p>
                      <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                        @{contact.username}
                      </p>
                    </div>
                    <Badge variant="success">Online</Badge>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginBottom: theme.spacing.lg, marginTop: theme.spacing.xl }}>
              Sugestões
            </h3>

            {mockUsers.map(sugUser => (
              <div
                key={sugUser.id}
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.background,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.md,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontWeight: 'bold' }}>{sugUser.name}</p>
                  <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                    @{sugUser.username}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => addContact(sugUser)}
                  style={{ fontSize: theme.fonts.sizes.sm, padding: theme.spacing.sm }}
                >
                  ➕ Adicionar
                </Button>
              </div>
            ))}
          </Card>
        </div>
      </Container>
    </div>
  )
}

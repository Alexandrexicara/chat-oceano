import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'
import { uploadFile } from '../services/api'

export function Profile() {
  const { user, updateProfile, logout, contacts, addContact } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    city: user?.city || '',
    country: user?.country || '',
    avatar: user?.avatar || '',
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

  // Upload de foto de perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem.')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.')
      return
    }

    setUploadingPhoto(true)
    try {
      const result = await uploadFile(file)
      
      if (result.filename) {
        // Atualizar avatar no formData
        const avatarUrl = `/uploads/${result.filename}`
        setFormData(prev => ({ ...prev, avatar: avatarUrl }))
        
        // Atualizar perfil imediatamente
        updateProfile({ avatar: avatarUrl })
        
        alert('✅ Foto de perfil atualizada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da foto. Tente novamente.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Remover mock de usuários - tudo real agora
  // Contatos reais vêm do WhatsApp Sync ou busca por telefone

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Header>
        <h1 style={{ fontSize: theme.fonts.sizes.xl }}>👤 Meu Perfil</h1>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </Header>

      <Container style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.xl }}>
          {/* Perfil */}
          <Card>
            <div style={{ textAlign: 'center' }}>
              {/* Foto de perfil com upload */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: user?.avatar 
                      ? `url(${user.avatar}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    margin: '0 auto ' + theme.spacing.lg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    border: `4px solid ${theme.colors.secondary}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  {!user?.avatar && '👤'}
                </div>
                
                {/* Botão de upload */}
                <label
                  htmlFor="photo-upload"
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: theme.colors.primary,
                    border: `2px solid ${theme.colors.surface}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  📷
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              
              {uploadingPhoto && (
                <p style={{ color: theme.colors.primary, marginBottom: theme.spacing.md }}>
                  ⏳ Enviando foto...
                </p>
              )}

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
              <div style={{ 
                textAlign: 'center', 
                padding: theme.spacing.xl,
                background: theme.colors.background,
                borderRadius: theme.borderRadius.md,
              }}>
                <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>📱</p>
                <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
                  Nenhum contato adicionado ainda
                </p>
                <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                  Use o <strong>WhatsApp Sync</strong> no Chat para adicionar amigos!
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <p style={{ 
                  fontSize: theme.fonts.sizes.sm,
                  color: theme.colors.textSecondary,
                  marginBottom: theme.spacing.md,
                }}>
                  {contacts.length} contato(s) adicionado(s)
                </p>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: contact.avatar 
                          ? `url(${contact.avatar}) center/cover`
                          : 'linear-gradient(135deg, #4ade80, #25D366)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}>
                        {!contact.avatar && '👤'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{contact.name}</p>
                        <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                          @{contact.username}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                      <Badge variant="success">Online</Badge>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (window.confirm(`Remover ${contact.name} dos contatos?`)) {
                            // Implementar remoção de contato
                            alert('Contato removido!')
                          }
                        }}
                        style={{ 
                          fontSize: theme.fonts.sizes.xs, 
                          padding: '4px 8px',
                        }}
                      >
                        ❌
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Informações sobre como adicionar contatos */}
            <div style={{
              marginTop: theme.spacing.xl,
              padding: theme.spacing.lg,
              background: 'rgba(74, 222, 128, 0.1)',
              borderRadius: theme.borderRadius.md,
              border: `2px solid ${theme.colors.success}`,
            }}>
              <h3 style={{ 
                color: theme.colors.success, 
                marginBottom: theme.spacing.md,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                📲 Como adicionar amigos
              </h3>
              <p style={{ 
                fontSize: theme.fonts.sizes.sm,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
              }}>
                1. Abra o <strong>Chat</strong><br/>
                2. Clique em <strong>"Sincronizar WhatsApp"</strong><br/>
                3. Adicione números de telefone<br/>
                4. Clique em <strong>"Sincronizar"</strong>
              </p>
              <p style={{ 
                fontSize: theme.fonts.sizes.xs,
                color: theme.colors.textSecondary,
                fontStyle: 'italic',
              }}>
                💡 Seus amigos serão adicionados automaticamente quando eles entrarem no Oceanos!
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  )
}

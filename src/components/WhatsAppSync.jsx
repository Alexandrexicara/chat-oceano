import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input } from './BaseComponents'
import { theme } from '../styles/theme'
import { findUsersByPhones, sendWhatsAppInvite } from '../services/api'

// Componente para sincronizar contatos do WhatsApp
export function WhatsAppSync({ onClose }) {
  const { user } = useAuth()
  const [whatsappContacts, setWhatsappContacts] = useState([])
  const [oceanosUsers, setOceanosUsers] = useState([])
  const [nonUsers, setNonUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [manualPhone, setManualPhone] = useState('')

  // Simular contatos do WhatsApp (em produção, viria do backend)
  useEffect(() => {
    // Mock de contatos do WhatsApp - em produção seria via API
    const mockContacts = [
      { name: 'João Silva', phone: '+5511999991111', avatar: '👤' },
      { name: 'Maria Santos', phone: '+5511999992222', avatar: '👩' },
      { name: 'Pedro Costa', phone: '+5511999993333', avatar: '🧑' },
      { name: 'Ana Oliveira', phone: '+5511999994444', avatar: '👧' },
      { name: 'Carlos Mendes', phone: '+5511999995555', avatar: '👨' },
    ]
    setWhatsappContacts(mockContacts)
  }, [])

  // Sincronizar contatos com o Oceanos
  const handleSync = async () => {
    setLoading(true)
    try {
      const phones = whatsappContacts.map(c => c.phone)
      const foundUsers = await findUsersByPhones(phones)
      
      // Separar usuários do Oceanos de não-usuários
      const oceanosUsersList = []
      const nonUsersList = []
      
      whatsappContacts.forEach(contact => {
        const oceanosUser = foundUsers.find(u => u.phone === contact.phone)
        if (oceanosUser) {
          oceanosUsersList.push({
            ...oceanosUser,
            whatsappName: contact.name,
            whatsappPhone: contact.phone,
            avatar: contact.avatar
          })
        } else {
          nonUsersList.push(contact)
        }
      })
      
      setOceanosUsers(oceanosUsersList)
      setNonUsers(nonUsersList)
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      alert('Erro ao sincronizar contatos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Enviar convite pelo WhatsApp
  const handleSendInvite = async (contact) => {
    try {
      const result = await sendWhatsAppInvite(contact.phone.replace(/\D/g, ''), user?.name || 'Um amigo')
      
      if (result.whatsappLink) {
        // Abrir WhatsApp Web com mensagem pronta
        window.open(result.whatsappLink, '_blank')
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error)
      alert('Erro ao enviar convite. Tente novamente.')
    }
  }

  // Adicionar contato manualmente
  const handleAddManual = () => {
    if (!manualPhone.trim()) {
      alert('Digite um número de telefone')
      return
    }
    
    const newContact = {
      name: 'Contato adicionado',
      phone: manualPhone,
      avatar: '👤'
    }
    
    setWhatsappContacts([...whatsappContacts, newContact])
    setManualPhone('')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    }}>
      <Card style={{
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Botão fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: theme.colors.text,
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h2 style={{ marginBottom: theme.spacing.lg, color: theme.colors.primary }}>
          📱 Sincronizar Contatos do WhatsApp
        </h2>

        <p style={{ marginBottom: theme.spacing.md, color: theme.colors.textSecondary }}>
          Encontre seus amigos do WhatsApp que já usam o Oceanos ou envie convites!
        </p>

        {/* Adicionar contato manual */}
        <div style={{ 
          display: 'flex', 
          gap: theme.spacing.sm, 
          marginBottom: theme.spacing.lg 
        }}>
          <Input
            placeholder="+55 11 99999-9999"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleAddManual} variant="secondary">
            ➕ Adicionar
          </Button>
        </div>

        {/* Botão sincronizar */}
        <Button 
          onClick={handleSync} 
          variant="primary"
          style={{ width: '100%', marginBottom: theme.spacing.xl }}
          disabled={loading}
        >
          {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar com Oceanos'}
        </Button>

        {/* Usuários do Oceanos */}
        {oceanosUsers.length > 0 && (
          <div style={{ marginBottom: theme.spacing.xl }}>
            <h3 style={{ color: theme.colors.secondary, marginBottom: theme.spacing.md }}>
              ✅ Amigos no Oceanos ({oceanosUsers.length})
            </h3>
            {oceanosUsers.map(user => (
              <div key={user.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: theme.spacing.md,
                background: theme.colors.background,
                borderRadius: theme.borderRadius.md,
                marginBottom: theme.spacing.sm,
              }}>
                <span style={{ fontSize: '32px', marginRight: theme.spacing.md }}>
                  {user.avatar}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', color: theme.colors.text }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                    @{user.username} • {user.status}
                  </p>
                </div>
                <Button variant="primary" style={{ padding: '8px 16px' }}>
                  💬 Conversar
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Não-usuários */}
        {nonUsers.length > 0 && (
          <div>
            <h3 style={{ color: '#ff9800', marginBottom: theme.spacing.md }}>
              📲 Convide seus amigos ({nonUsers.length})
            </h3>
            {nonUsers.map(contact => (
              <div key={contact.phone} style={{
                display: 'flex',
                alignItems: 'center',
                padding: theme.spacing.md,
                background: theme.colors.background,
                borderRadius: theme.borderRadius.md,
                marginBottom: theme.spacing.sm,
              }}>
                <span style={{ fontSize: '32px', marginRight: theme.spacing.md }}>
                  {contact.avatar}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', color: theme.colors.text }}>
                    {contact.name}
                  </p>
                  <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                    {contact.phone}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => handleSendInvite(contact)}
                  style={{ padding: '8px 16px' }}
                >
                  📩 Convidar
                </Button>
              </div>
            ))}
          </div>
        )}

        {oceanosUsers.length === 0 && nonUsers.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: theme.spacing.xl,
            color: theme.colors.textSecondary,
          }}>
            <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>👆</p>
            <p>Clique em "Sincronizar" para encontrar seus amigos!</p>
          </div>
        )}
      </Card>
    </div>
  )
}

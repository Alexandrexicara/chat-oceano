import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input } from './BaseComponents'
import { theme } from '../styles/theme'
import { findUsersByPhones, sendWhatsAppInvite, addContact } from '../services/api'

// Componente para sincronizar contatos do WhatsApp
export function WhatsAppSync({ onClose }) {
  const { user } = useAuth()
  const [whatsappContacts, setWhatsappContacts] = useState([])
  const [oceanosUsers, setOceanosUsers] = useState([])
  const [nonUsers, setNonUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [manualPhone, setManualPhone] = useState('')

  // Carregar contatos do localStorage (em produção, viria do backend)
  useEffect(() => {
    const savedContacts = localStorage.getItem(`whatsapp_contacts_${user?.id}`)
    if (savedContacts) {
      setWhatsappContacts(JSON.parse(savedContacts))
    }
  }, [user])

  // Sincronizar contatos com o Oceanos
  const handleSync = async () => {
    if (whatsappContacts.length === 0) {
      alert('Adicione pelo menos um contato primeiro!')
      return
    }
    
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
      
      // SALVAR CONTATOS ENCONTRADOS NO BANCO DE DADOS
      let contatosSalvos = 0
      for (const oceanosUser of oceanosUsersList) {
        try {
          console.log(`💾 Salvando contato: ${oceanosUser.name} (${oceanosUser.id})`)
          await addContact(user.id, oceanosUser.id)
          contatosSalvos++
          console.log(`✅ Contato salvo com sucesso!`)
        } catch (error) {
          // Pode dar erro de duplicação, ignora
          console.log(`⚠️ Contato já existe ou erro:`, error.message)
        }
      }
      
      setOceanosUsers(oceanosUsersList)
      setNonUsers(nonUsersList)
      
      // Salvar contatos sincronizados no localStorage
      localStorage.setItem(`whatsapp_contacts_${user?.id}`, JSON.stringify(whatsappContacts))
      
      // Mostrar resumo dos resultados
      const total = whatsappContacts.length
      const encontrados = oceanosUsersList.length
      const naoEncontrados = nonUsersList.length
      
      let mensagem = `📊 Resultado da Sincronização:\n\n`
      mensagem += `📱 Total de contatos: ${total}\n`
      mensagem += `✅ No Oceanos: ${encontrados}\n`
      mensagem += `💾 Salvos no banco: ${contatosSalvos}\n`
      mensagem += `📲 Não encontrados: ${naoEncontrados}\n\n`
      
      if (encontrados > 0) {
        mensagem += `🎉 Você tem ${encontrados} amigo(s) no Oceanos!\n\n`
        mensagem += `👆 Agora eles aparecem na sua lista de contatos!`
      } else {
        mensagem += `👆 Nenhum amigo encontrado. Convide-os para entrar!`
      }
      
      alert(mensagem)
      
      // Fechar o modal e recarregar contatos do Chat
      if (contatosSalvos > 0) {
        setTimeout(() => {
          onClose()
          window.location.reload() // Recarrega para atualizar lista de contatos
        }, 1500)
      }
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
        const confirmed = window.confirm(
          `📱 Abrir WhatsApp para convidar ${contact.name}?\n\n` +
          `O link será aberto com uma mensagem de convite pronta para enviar!`
        )
        
        if (confirmed) {
          window.open(result.whatsappLink, '_blank')
        }
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
      id: Date.now(),
      name: 'Contato adicionado',
      phone: manualPhone,
      avatar: '👤'
    }
    
    const updatedContacts = [...whatsappContacts, newContact]
    setWhatsappContacts(updatedContacts)
    // Salvar no localStorage
    localStorage.setItem(`whatsapp_contacts_${user?.id}`, JSON.stringify(updatedContacts))
    setManualPhone('')
    alert('Contato adicionado! Clique em "Sincronizar" para buscar no Oceanos.')
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
          <Button 
            onClick={handleAddManual} 
            variant="secondary"
            style={{ 
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              fontSize: theme.fonts.sizes.md,
            }}
          >
            ➕ Adicionar
          </Button>
        </div>

        {/* Botão sincronizar - HORIZONTAL E MAIOR */}
        <div style={{ 
          display: 'flex', 
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
          flexWrap: 'wrap',
        }}>
          <Button 
            onClick={handleSync} 
            variant="primary"
            style={{ 
              flex: 1,
              minWidth: '140px',
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              fontSize: theme.fonts.sizes.lg,
            }}
            disabled={loading}
          >
            {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
          </Button>
          
          <Button 
            onClick={onClose}
            variant="secondary"
            style={{ 
              flex: 1,
              minWidth: '140px',
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              fontSize: theme.fonts.sizes.lg,
            }}
          >
            ✖️ Fechar
          </Button>
        </div>

        {/* Usuários do Oceanos */}
        {oceanosUsers.length > 0 && (
          <div style={{ marginBottom: theme.spacing.xl }}>
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
                <Button 
                  variant="primary" 
                  onClick={() => {
                    alert(`✅ ${user.name} foi adicionado aos seus contatos!\n\nAgora você pode conversar com ele pelo Chat.`)
                    onClose() // Fecha o modal
                    window.location.reload() // Recarrega para mostrar o contato
                  }}
                  style={{ 
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    fontSize: theme.fonts.sizes.md,
                  }}
                >
                  💬 Conversar
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Não-usuários */}
        {nonUsers.length > 0 && (
          <div style={{ marginBottom: theme.spacing.xl }}>
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
                  style={{ 
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    fontSize: theme.fonts.sizes.md,
                  }}
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
            background: theme.colors.background,
            borderRadius: theme.borderRadius.md,
          }}>
            <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>📲</p>
            <p style={{ fontSize: theme.fonts.sizes.md, marginBottom: theme.spacing.sm }}>
              <strong>Adicione contatos acima</strong>
            </p>
            <p style={{ fontSize: theme.fonts.sizes.sm }}>
              Digite o número e clique em "Adicionar".<br/>
              Depois clique em "Sincronizar" para buscar amigos no Oceanos!
            </p>
          </div>
        )}

        {/* Resultados da sincronização */}
        {oceanosUsers.length > 0 && (
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
              ✅ Amigos no Oceanos ({oceanosUsers.length})
            </h3>
            <p style={{ 
              fontSize: theme.fonts.sizes.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.md,
            }}>
              Estes contatos já estão usando o Oceanos!
            </p>
          </div>
        )}

        {nonUsers.length > 0 && (
          <div style={{ 
            marginTop: theme.spacing.lg,
            padding: theme.spacing.lg,
            background: 'rgba(255, 152, 0, 0.1)',
            borderRadius: theme.borderRadius.md,
            border: '2px solid #ff9800',
          }}>
            <h3 style={{ 
              color: '#ff9800', 
              marginBottom: theme.spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              📲 Convide seus amigos ({nonUsers.length})
            </h3>
            <p style={{ 
              fontSize: theme.fonts.sizes.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.md,
            }}>
              Estes contatos ainda não usam o Oceanos. Convide-os!
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'
import { playMessageSound } from '../utils/sounds'

// Componente da Garrafa
function Bottle({ message, onClick, isOwn }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        perspective: '1000px',
        transition: 'transform 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05) rotateY(5deg)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1) rotateY(0deg)'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: theme.spacing.md,
          background: `linear-gradient(135deg, ${isOwn ? theme.colors.primary : '#1a4d6d'} 0%, ${isOwn ? '#004a99' : '#0d2a42'} 100%)`,
          borderRadius: '50% 50% 50% 45%',
          width: '60px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: `0 4px 15px rgba(0, 163, 255, 0.3)`,
          border: `2px solid ${theme.colors.secondary}`,
          position: 'relative',
          animation: `float ${3}s ease-in-out infinite`,
        }}
      >
        🍾
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '15px',
            background: '#8B4513',
            borderRadius: '3px 3px 0 0',
          }}
        />
      </div>
      <p style={{ fontSize: theme.fonts.sizes.xs, marginTop: theme.spacing.sm, color: theme.colors.textSecondary }}>
        Clique para abrir
      </p>
    </div>
  )
}

// Modal para abrir a garrafa
function BottleModal({ message, onClose, userName }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <Card
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          animation: 'scaleUp 0.4s ease',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
          <div style={{ fontSize: '60px', marginBottom: theme.spacing.md }}>🍾</div>
          <h2>Mensagem de {userName}</h2>
          <p style={{ color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.sm }}>
            {message.timestamp}
          </p>
        </div>

        {/* Conteúdo da mensagem */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          {message.text && (
            <p style={{ fontSize: theme.fonts.sizes.md, lineHeight: '1.6' }}>
              {message.text}
            </p>
          )}
        </div>

        {/* Imagem/Vídeo/Arquivo */}
        {message.mediaType && message.mediaUrl && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            {message.mediaType.startsWith('image/') && (
              <img
                src={message.mediaUrl}
                alt="Imagem"
                style={{
                  maxWidth: '100%',
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.md,
                }}
              />
            )}
            {message.mediaType.startsWith('video/') && (
              <video
                src={message.mediaUrl}
                controls
                style={{
                  maxWidth: '100%',
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.md,
                }}
              />
            )}
            {!message.mediaType.startsWith('image/') && !message.mediaType.startsWith('video/') && (
              <div
                style={{
                  padding: theme.spacing.lg,
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                  marginBottom: theme.spacing.md,
                }}
              >
                <p style={{ fontSize: '30px', marginBottom: theme.spacing.md }}>📎</p>
                <p style={{ fontWeight: 'bold', marginBottom: theme.spacing.sm }}>
                  {message.fileName || 'Arquivo'}
                </p>
                <Button variant="primary" onClick={() => window.open(message.mediaUrl)}>
                  📥 Baixar Arquivo
                </Button>
              </div>
            )}
          </div>
        )}

        <Button onClick={onClose} variant="secondary" style={{ width: '100%' }}>
          Fechar Garrafa
        </Button>
      </Card>
    </div>
  )
}

export function Chat() {
  const { user, logout } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState({})
  const [newMessage, setNewMessage] = useState('')
  const [selectedBottle, setSelectedBottle] = useState(null)
  const [chats, setChats] = useState([
    { id: 1, name: 'João Silva', avatar: '👤', lastMessage: 'Olá! Tudo bem?', unread: 2 },
    { id: 2, name: 'Maria Santos', avatar: '👩', lastMessage: 'Até mais tarde!', unread: 0 },
    { id: 3, name: 'Grupo Amigos', avatar: '👥', lastMessage: 'Vamos sair amanhã?', unread: 5 },
  ])
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const chatId = selectedChat.id
    const message = {
      id: Date.now(),
      sender: user.name,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      mediaUrl: null,
      mediaType: null,
    }

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }))

    // Simular resposta automática
    setTimeout(() => {
      playMessageSound() // Som quando chega mensagem
      
      const reply = {
        id: Date.now() + 1,
        sender: selectedChat.name,
        text: '👋 Recebi sua mensagem!',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        mediaUrl: null,
        mediaType: null,
      }
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), reply],
      }))
    }, 1000)

    setNewMessage('')
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedChat) return

    const reader = new FileReader()
    
    reader.onload = (event) => {
      const mediaUrl = event.target?.result
      const mediaType = file.type

      const message = {
        id: Date.now(),
        sender: user.name,
        text: `📎 Arquivo enviado: ${file.name}`,
        fileName: file.name,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
      }

      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), message],
      }))

      // Resposta automática com som
      setTimeout(() => {
        playMessageSound()
        
        const reply = {
          id: Date.now() + 1,
          sender: selectedChat.name,
          text: '✅ Arquivo recebido com sucesso!',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
          mediaUrl: null,
          mediaType: null,
        }
        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), reply],
        }))
      }, 1500)
    }

    reader.readAsDataURL(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <Header>
        <h1 style={{ fontSize: theme.fonts.sizes.xl }}>🌊 Oceanos Chat - Garrafas de Mensagens</h1>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </Header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Compacta com Avatares */}
        <div
          style={{
            width: '100px',
            background: `linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
            borderRight: `2px solid ${theme.colors.primary}`,
            overflowY: 'auto',
            padding: theme.spacing.sm,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: theme.spacing.xs,
                cursor: 'pointer',
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                background: selectedChat?.id === chat.id ? theme.colors.primary : 'transparent',
                transition: 'all 0.3s ease',
                border: selectedChat?.id === chat.id ? `2px solid ${theme.colors.secondary}` : `2px solid transparent`,
                minWidth: '80px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = theme.colors.surface
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = selectedChat?.id === chat.id ? theme.colors.primary : 'transparent'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: `0 4px 12px rgba(0, 163, 255, 0.3)`,
                  border: `2px solid ${theme.colors.secondary}`,
                }}
              >
                {chat.avatar}
              </div>
              
              {/* Nome embaixo do avatar */}
              <p
                style={{
                  fontSize: theme.fonts.sizes.xs,
                  textAlign: 'center',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: theme.colors.text,
                  fontWeight: 'bold',
                }}
              >
                {chat.name.split(' ')[0]}
              </p>

              {/* Badge de não lido */}
              {chat.unread > 0 && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#ff6b6b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: theme.fonts.sizes.xs,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Área Principal - Oceano ou Chat */}
        {selectedChat ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.colors.background }}>
            {/* Header do Chat */}
            <div
              style={{
                padding: theme.spacing.lg,
                borderBottom: `2px solid ${theme.colors.primary}`,
                background: `linear-gradient(90deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`,
              }}
            >
              <h2 style={{ fontSize: theme.fonts.sizes.lg }}>
                {selectedChat.avatar} {selectedChat.name}
              </h2>
              <p style={{ color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.sm }}>
                Última mensagem: {selectedChat.lastMessage}
              </p>
            </div>

            {/* Área das Garrafas - COM MAIS ESPAÇO */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: theme.spacing.xxl,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.xxl,
                background: `radial-gradient(circle at 20% 50%, rgba(0, 163, 255, 0.05) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(0, 102, 204, 0.05) 0%, transparent 50%)`,
              }}
            >
              {(messages[selectedChat.id] || []).length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: theme.colors.textSecondary,
                    animation: 'float 4s ease-in-out infinite',
                  }}
                >
                  <p style={{ fontSize: '100px', marginBottom: theme.spacing.lg, animation: 'wave 3s ease-in-out infinite' }}>🌊</p>
                  <h2 style={{ fontSize: theme.fonts.sizes.xl, marginBottom: theme.spacing.md }}>Oceano vazio</h2>
                  <p>Envie uma garrafa para começar a conversa com {selectedChat.name}!</p>
                  <p style={{ marginTop: theme.spacing.lg, fontSize: theme.fonts.sizes.sm }}>🍾</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xxl, alignItems: 'flex-start' }}>
                  {(messages[selectedChat.id] || []).map((msg, idx) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.isOwn ? 'flex-end' : 'flex-start',
                        minWidth: 'fit-content',
                        animation: `scaleUp 0.5s ease-out ${idx * 0.1}s both`,
                      }}
                    >
                      <p style={{ fontSize: theme.fonts.sizes.sm, marginBottom: theme.spacing.md, color: theme.colors.secondary, fontWeight: 'bold' }}>
                        {msg.sender}
                      </p>
                      <Bottle
                        message={msg}
                        onClick={() => setSelectedBottle(msg)}
                        isOwn={msg.isOwn}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem com Upload */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: theme.spacing.lg,
                borderTop: `2px solid ${theme.colors.primary}`,
                background: theme.colors.surface,
                display: 'flex',
                gap: theme.spacing.md,
                flexWrap: 'wrap',
                boxShadow: `0 -4px 12px rgba(0, 0, 0, 0.3)`,
              }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Escreva uma mensagem..."
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: theme.spacing.md,
                  background: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.fonts.sizes.md,
                }}
              />

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />

              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                📎
              </Button>

              <Button type="submit" variant="primary">
                🍾
              </Button>
            </form>
          </div>
        ) : (
          /* OCEANO BONITO - quando nenhum chat está selecionado */
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(180deg, 
                rgba(10, 22, 40, 0.9) 0%,
                rgba(26, 47, 77, 0.8) 50%,
                rgba(0, 102, 204, 0.3) 100%)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ondas animadas */}
            <div style={{ position: 'absolute', width: '200%', height: '100%', opacity: 0.1 }}>
              <div style={{ animation: 'wave 8s linear infinite', position: 'absolute', width: '100%', height: '100%', background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%2300a3ff' d='M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z'/%3E%3C/svg%3E")` }} />
            </div>

            {/* Conteúdo Central */}
            <div style={{ textAlign: 'center', zIndex: 10, color: theme.colors.text }}>
              <div style={{ fontSize: '150px', marginBottom: theme.spacing.lg, animation: 'float 4s ease-in-out infinite' }}>
                🌊
              </div>
              <h1 style={{ fontSize: theme.fonts.sizes.xxl, marginBottom: theme.spacing.md, fontWeight: 'bold' }}>
                Bem-vindo ao Oceano
              </h1>
              <p style={{ fontSize: theme.fonts.sizes.lg, color: theme.colors.secondary, marginBottom: theme.spacing.lg }}>
                Selecione um amigo à esquerda para começar
              </p>
              <p style={{ fontSize: '60px', animation: 'float 3s ease-in-out infinite 0.5s' }}>🍾</p>
            </div>

            {/* Bolhas flutuando */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${30 + i * 10}px`,
                  height: `${30 + i * 10}px`,
                  borderRadius: '50%',
                  background: `rgba(0, 163, 255, ${0.1 - i * 0.02})`,
                  animation: `float ${4 + i}s ease-in-out infinite`,
                  left: `${20 + i * 15}%`,
                  bottom: `${-50 + i * 20}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal da Garrafa */}
      {selectedBottle && (
        <BottleModal
          message={selectedBottle}
          onClose={() => setSelectedBottle(null)}
          userName={selectedBottle.sender}
        />
      )}
    </div>
  )
}

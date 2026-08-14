import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Button, Input, Badge } from '../components/BaseComponents'
import { WhatsAppSync } from '../components/WhatsAppSync'
// REMOVIDO: MiniAnuncio e ExoclickAd - oceano agora é apenas na página Status
import { useCDCoin, CDCoinDisplay } from '../hooks/useCDCoin'
import { theme } from '../styles/theme'
import { playMessageSound, playBottleSound } from '../utils/sounds'
import { getMessages, sendMessage as sendApiMessage, getContacts, uploadFile } from '../services/api'
import { io } from 'socket.io-client'

// Componente para gravar áudio
function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        onRecordingComplete({ url, blob, type: 'audio' })
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      alert('Não foi possível acessar o microfone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {!isRecording ? (
        <Button
          type="button"
          variant="secondary"
          onClick={startRecording}
          style={{
            borderRadius: theme.borderRadius.full,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            fontSize: theme.fonts.sizes.sm,
          }}
          title="Gravar áudio"
        >
          🎤
        </Button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#ff4444',
            animation: 'pulse 1s infinite'
          }} />
          <span style={{ fontSize: theme.fonts.sizes.sm, color: '#ff4444' }}>
            {formatTime(recordingTime)}
          </span>
          <Button
            type="button"
            variant="danger"
            onClick={stopRecording}
            style={{
              borderRadius: theme.borderRadius.full,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              fontSize: theme.fonts.sizes.sm,
            }}
          >
            ⏹️ Parar
          </Button>
        </div>
      )}
    </div>
  )
}

// Componente para gravar vídeo
function VideoRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const videoPreviewRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      })
      streamRef.current = stream
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        onRecordingComplete({ url, blob, type: 'video' })
        setShowPreview(false)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setShowPreview(true)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert('Não foi possível acessar a câmera')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const cancelRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
    setShowPreview(false)
    clearInterval(timerRef.current)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (showPreview) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          muted
          style={{
            maxWidth: '90%',
            maxHeight: '70vh',
            borderRadius: theme.borderRadius.lg,
            transform: 'scaleX(-1)'
          }}
        />
        <div style={{ 
          marginTop: theme.spacing.lg, 
          display: 'flex', 
          gap: theme.spacing.lg,
          alignItems: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#ff4444',
            animation: 'pulse 1s infinite'
          }} />
          <span style={{ fontSize: theme.fonts.sizes.lg, color: '#fff' }}>
            {formatTime(recordingTime)}
          </span>
          <Button
            type="button"
            variant="danger"
            onClick={stopRecording}
            style={{
              borderRadius: theme.borderRadius.full,
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              fontSize: theme.fonts.sizes.md,
            }}
          >
            ⏹️ Parar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={cancelRecording}
            style={{
              borderRadius: theme.borderRadius.full,
              padding: `${theme.spacing.md} ${theme.spacing.xl}`,
              fontSize: theme.fonts.sizes.md,
            }}
          >
            ❌ Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={startRecording}
      style={{
        borderRadius: theme.borderRadius.full,
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.fonts.sizes.sm,
      }}
      title="Gravar vídeo"
    >
      🎥
    </Button>
  )
}

// REMOVIDO: Componentes Bottle, Barrel e BottleModal - oceano agora é apenas na página Status

// REMOVIDO: Dados mockados - agora tudo é REAL do banco de dados
// Contatos e mensagens vêm do PostgreSQL via API

const autoResponses = [
  'Que legal! 🍾',
  'Concordo totalmente!',
  'Haha, boa! 😄',
  'Vamos sim! 🌊',
  'Interessante... me conta mais!',
  '👍 Perfeito!',
  'Adorei a ideia!',
  'Show! Falou tudo!',
]

export function Chat() {
  const { user, logout } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState({}) // REMOVIDO: mockMessages - agora vem do banco
  const [searchTerm, setSearchTerm] = useState('')
  const [showContactsOnMobile, setShowContactsOnMobile] = useState(true)
  const [contacts, setContacts] = useState([]) // REMOVIDO: mockContacts - agora vem do banco
  const [loading, setLoading] = useState(true)
  const [showWhatsAppSync, setShowWhatsAppSync] = useState(false)
  // REMOVIDO: showMiniAnuncio, selectedBottle, openedBottles - oceano agora é apenas na página Status
  const { saldo, pontuar, adicionarPontos } = useCDCoin()
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const videoRecorderRef = useRef(null)
  const socketRef = useRef(null)

  // Carregar mensagens do chat quando selecionar um contato
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!selectedChat || !user?.id) return
      
      try {
        console.log(`📥 Carregando mensagens do chat com ${selectedChat.name}...`)
        const chatMessages = await getMessages(user.id, selectedChat.id)
        
        if (chatMessages.length > 0) {
          const formattedMessages = chatMessages.map(msg => ({
            id: msg.id,
            sender: msg.sender_id === user.id ? 'me' : 'them',
            senderName: msg.sender_id === user.id ? (user.name || 'Você') : selectedChat.name,
            text: msg.text,
            time: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            mediaUrl: msg.media_url,
            mediaType: msg.media_type,
          }))
          
          setMessages(prev => ({
            ...prev,
            [selectedChat.id]: formattedMessages,
          }))
          console.log(`✅ ${formattedMessages.length} mensagens carregadas!`)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar mensagens do chat:', error)
      }
    }
    
    loadChatMessages()
  }, [selectedChat, user])

  // Pontuar acesso diário ao entrar no Chat
  useEffect(() => {
    pontuar.acessoDiario()
  }, [])

  // Carregar dados REAIS do backend (PostgreSQL)
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        console.log('⚠️ Usuário não autenticado')
        setLoading(false)
        return
      }

      try {
        // REMOVIDO: Carregar mensagens do oceano - agora é apenas na página Status
        // O Chat deve mostrar apenas mensagens privadas entre contatos

        // Carregar contatos REAIS do banco
        const userContacts = await getContacts(user.id)
        if (userContacts.length > 0) {
          setContacts(userContacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            username: contact.username,
            avatar: contact.avatar || '👤',
            status: contact.status || 'Offline',
            lastMessage: 'Clique para conversar',
            time: 'Agora'
          })))
        } else {
          console.log('📱 Nenhum contato encontrado. Use o WhatsApp Sync para adicionar!')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Erro ao carregar dados do banco:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Configurar WebSocket
  useEffect(() => {
    // Detectar URL do backend (local ou produção)
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : window.location.origin
    
    socketRef.current = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 5000, // 5 segundos entre tentativas
      reconnectionAttempts: 5, // Máximo 5 tentativas
      timeout: 10000, // Timeout de 10 segundos
    })
    
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket conectado!')
    })
    
    socketRef.current.on('connect_error', (err) => {
      console.log('⚠️ WebSocket não conectado (backend offline):', err.message)
    })
    socketRef.current.on('new_message', (message) => {
      // REMOVIDO: Não processar mensagens do oceano no Chat
      // O Chat deve mostrar apenas mensagens privadas (is_oceano = false)
      if (message.is_oceano) {
        return // Ignorar mensagens do oceano
      }
      
      // Som de mensagem quando recebe nova mensagem privada
      playBottleSound()
      
      if (selectedChat && (message.sender_id === selectedChat.id || message.receiver_id === selectedChat.id)) {
        // Adicionar ao chat atual
        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), {
            ...message,
            sender: message.sender_id === user?.id ? 'me' : 'them',
            senderName: message.sender_name || 'Usuário',
            time: new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }]
        }))
      }
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user, selectedChat])

  // REMOVIDO: bottlePositions - oceano agora é apenas na página Status

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedChat])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedChat) return

    try {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      const newMsg = {
        sender_id: user?.id,
        receiver_id: selectedChat.id,
        text: messageText.trim(),
        time: timeStr,
      }

      // Enviar para API
      const savedMessage = await sendApiMessage(newMsg)

      const localMsg = {
        id: savedMessage.id,
        sender: 'me',
        senderName: user?.name || 'Você',
        text: messageText.trim(),
        time: timeStr,
      }

      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), localMsg],
      }))
      setMessageText('')

      // Pontuar por enviar mensagem
      pontuar.mensagemEnviada()

      // Tocar som de garrafa
      playBottleSound()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const targetChat = selectedChat
    
    try {
      // Upload do arquivo para o servidor
      console.log('📤 Fazendo upload do arquivo:', file.name)
      const uploadResult = await uploadFile(file)
      const mediaUrl = uploadResult.filename ? `/uploads/${uploadResult.filename}` : null
      console.log('✅ Upload concluído:', mediaUrl)
      
      const mediaType = file.type.startsWith('image/') ? 'image'
        : file.type.startsWith('video/') ? 'video'
        : file.type.startsWith('audio/') ? 'audio'
        : 'file'

      const now = new Date()
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      if (targetChat) {
        // Enviar como mensagem no chat
        const newMsg = {
          sender_id: user?.id,
          receiver_id: targetChat.id,
          text: mediaType === 'video' ? `🛢️ ${file.name}` : `📎 ${file.name}`,
          media_url: mediaUrl,
          media_type: mediaType,
          file_name: file.name,
        }
        
        const savedMessage = await sendApiMessage(newMsg)
        
        const localMsg = {
          id: savedMessage.id,
          sender: 'me',
          senderName: user?.name || 'Você',
          text: mediaType === 'video' ? `🛢️ ${file.name}` : `📎 ${file.name}`,
          time: timeStr,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
        }

        setMessages(prev => ({
          ...prev,
          [targetChat.id]: [...(prev[targetChat.id] || []), localMsg],
        }))

        // Pontuar por enviar mídia
        if (mediaType === 'video') {
          pontuar.videoEnviado()
        } else {
          pontuar.mensagemEnviada()
        }
      } else {
        // REMOVIDO: Não é mais possível enviar para o oceano pelo Chat
        alert('Selecione um contato para enviar mensagens privadas')
        return
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      alert('Erro ao enviar arquivo: ' + (error.response?.data?.error || error.message))
    }

    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  // Handler para áudio gravado
  const handleAudioRecording = async (recording) => {
    try {
      // Upload do áudio para o servidor
      console.log('📤 Fazendo upload do áudio...')
      const response = await fetch(recording.url)
      const blob = await response.blob()
      const file = new File([blob], `audio_${user?.id}_${Date.now()}.webm`, { type: blob.type })
      const uploadResult = await uploadFile(file)
      const mediaUrl = uploadResult.filename ? `/uploads/${uploadResult.filename}` : recording.url
      console.log('✅ Áudio enviado:', mediaUrl)
      
      const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      if (selectedChat) {
        // Enviar como mensagem no chat
        const savedMessage = await sendApiMessage({
          sender_id: user?.id,
          receiver_id: selectedChat.id,
          text: '🎤 Áudio gravado',
          media_url: mediaUrl,
          media_type: 'audio',
          file_name: 'audio_gravado.webm',
        })
        
        const localMsg = {
          id: savedMessage.id,
          sender: 'me',
          senderName: user?.name || 'Você',
          text: '🎤 Áudio gravado',
          time: timeStr,
          mediaUrl: mediaUrl,
          mediaType: 'audio',
        }
        
        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), localMsg],
        }))
      } else {
        // REMOVIDO: Não é mais possível enviar para o oceano pelo Chat
        alert('Selecione um contato para enviar áudio')
        return
      }
    } catch (error) {
      console.error('❌ Erro ao enviar áudio:', error)
      alert('Erro ao enviar áudio: ' + (error.response?.data?.error || error.message))
    }
  }

  // Handler para vídeo gravado
  const handleVideoRecording = async (recording) => {
    try {
      // Upload do vídeo para o servidor
      console.log('📤 Fazendo upload do vídeo...')
      const response = await fetch(recording.url)
      const blob = await response.blob()
      const file = new File([blob], `video_${user?.id}_${Date.now()}.webm`, { type: blob.type })
      const uploadResult = await uploadFile(file)
      const mediaUrl = uploadResult.filename ? `/uploads/${uploadResult.filename}` : recording.url
      console.log('✅ Vídeo enviado:', mediaUrl)
      
      const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      if (selectedChat) {
        // Enviar como mensagem no chat
        const savedMessage = await sendApiMessage({
          sender_id: user?.id,
          receiver_id: selectedChat.id,
          text: '🎥 Vídeo gravado',
          media_url: mediaUrl,
          media_type: 'video',
          file_name: 'video_gravado.webm',
        })
        
        const localMsg = {
          id: savedMessage.id,
          sender: 'me',
          senderName: user?.name || 'Você',
          text: '🎥 Vídeo gravado',
          time: timeStr,
          mediaUrl: mediaUrl,
          mediaType: 'video',
        }
        
        setMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), localMsg],
        }))
      } else {
        // REMOVIDO: Não é mais possível enviar para o oceano pelo Chat
        alert('Selecione um contato para enviar vídeo')
        return
      }
    } catch (error) {
      console.error('❌ Erro ao enviar vídeo:', error)
      alert('Erro ao enviar vídeo: ' + (error.response?.data?.error || error.message))
    }
  }

  // REMOVIDO: renderFloatingItem e OceanView - oceano agora é apenas na página Status
  // REMOVIDO: MODO OCEANO - agora é apenas a página Status

  // Filtrar contatos REAIS (não mais mockados)
  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const chatMessages = selectedChat ? (messages[selectedChat.id] || []) : []

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background }}>
      <Header>
        <h1 style={{ fontSize: theme.fonts.sizes.xl }}>💬 Chat</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Exibir CDCOIN */}
          <CDCoinDisplay 
            saldo={saldo} 
            onConvertClick={() => alert('Em breve: tela de conversão de CDCOIN!')}
          />
          <Button 
            variant="primary" 
            onClick={() => setShowWhatsAppSync(true)}
            title="Sincronizar contatos do WhatsApp"
          >
            📱 WhatsApp
          </Button>
          <Button variant="secondary" onClick={logout}>
            Sair
          </Button>
        </div>
      </Header>

      {/* REMOVIDO: Mini-anuncio - oceano agora é apenas na página Status */}

      {/* Modal de sincronização WhatsApp */}
      {showWhatsAppSync && (
        <WhatsAppSync onClose={() => setShowWhatsAppSync(false)} />
      )}

      <div className={`chat-container ${selectedChat && !showContactsOnMobile ? 'chat-active' : ''}`} style={{ display: 'flex', height: 'calc(100vh - 70px - 60px)', overflow: 'hidden' }}>
        {/* Lista de Contatos */}
        <div
          className="contacts-sidebar"
          style={{
            width: '240px',
            minWidth: '200px',
            maxWidth: '280px',
            borderRight: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Busca */}
          <div style={{ padding: `${theme.spacing.xs} ${theme.spacing.sm}` }}>
            <Input
              placeholder="🔍 Pesquisar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredContacts.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.colors.textSecondary, padding: theme.spacing.xl }}>
                Nenhum contato encontrado
              </p>
            ) : (
              filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedChat(contact)
                    // No mobile, esconde a lista de contatos ao selecionar
                    if (window.innerWidth <= 768) {
                      setShowContactsOnMobile(false)
                    }
                  }}
                  style={{
                    padding: `${theme.spacing.xs} ${theme.spacing.xs}`,
                    cursor: 'pointer',
                    background: selectedChat?.id === contact.id ? theme.colors.primary : 'transparent',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (selectedChat?.id !== contact.id) {
                      e.currentTarget.style.background = theme.colors.background
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedChat?.id !== contact.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: theme.colors.background,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      border: `2px solid ${contact.status === 'Online' ? '#00c853' : theme.colors.border}`,
                    }}
                  >
                    {contact.avatar}
                  </div>
                  <div style={{ textAlign: 'center', width: '100%', padding: '0 4px' }}>
                    <p style={{ 
                      fontWeight: 'bold', 
                      fontSize: '12px',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {contact.name}
                    </p>
                    <p style={{
                      fontSize: '10px',
                      color: selectedChat?.id === contact.id ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
                      margin: '1px 0 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {contact.lastMessage}
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    alignItems: 'center',
                    marginTop: '2px',
                    padding: '0 4px'
                  }}>
                    <Badge variant={contact.status === 'Online' ? 'success' : 'warning'} style={{ fontSize: '8px', padding: '1px 3px' }}>
                      {contact.status}
                    </Badge>
                    <span style={{ fontSize: '9px', color: theme.colors.textSecondary }}>{contact.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área do Chat */}
        <div className="chat-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedChat ? (
            <>
              {/* Cabeçalho do Chat */}
              <div
                style={{
                  padding: theme.spacing.md,
                  background: theme.colors.surface,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}
              >
                {/* Botão voltar (só aparece no mobile) */}
                <button
                  onClick={() => setShowContactsOnMobile(true)}
                  style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    color: theme.colors.text,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: theme.spacing.xs,
                  }}
                  className="mobile-back-button"
                >
                  ←
                </button>
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
                  {selectedChat.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{selectedChat.name}</p>
                  <p style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                    @{selectedChat.username} • {selectedChat.status}
                  </p>
                </div>
              </div>

              {/* Área de mensagens do chat */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                position: 'relative',
                background: theme.colors.background,
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{
                    width: '100%',
                    textAlign: 'center',
                    color: theme.colors.textSecondary,
                    paddingTop: theme.spacing.xxl,
                  }}>
                    <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>💬</p>
                    <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                        marginBottom: theme.spacing.md,
                        padding: theme.spacing.sm,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: theme.spacing.md,
                          background: msg.sender === 'me' ? theme.colors.primary : theme.colors.surface,
                          borderRadius: theme.borderRadius.md,
                          color: msg.sender === 'me' ? '#fff' : theme.colors.text,
                        }}
                      >
                        <p>{msg.text}</p>
                        {msg.mediaUrl && msg.mediaType === 'image' && (
                          <img src={msg.mediaUrl} alt="imagem" style={{ maxWidth: '100%', marginTop: theme.spacing.sm, borderRadius: theme.borderRadius.sm }} />
                        )}
                        {msg.mediaUrl && msg.mediaType === 'video' && (
                          <video src={msg.mediaUrl} controls style={{ maxWidth: '100%', marginTop: theme.spacing.sm, borderRadius: theme.borderRadius.sm }} />
                        )}
                        {msg.mediaUrl && msg.mediaType === 'audio' && (
                          <audio src={msg.mediaUrl} controls style={{ width: '100%', marginTop: theme.spacing.sm }} />
                        )}
                        <p style={{ fontSize: theme.fonts.sizes.xs, opacity: 0.7, marginTop: theme.spacing.xs }}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Barra de Input */}
              <form
                onSubmit={handleSendMessage}
                className="chat-input-bar"
                style={{
                  padding: theme.spacing.sm,
                  background: theme.colors.surface,
                  borderTop: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  gap: theme.spacing.xs,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {/* Botão arquivo */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.avi,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    borderRadius: theme.borderRadius.full,
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    fontSize: theme.fonts.sizes.sm,
                  }}
                  title="Enviar arquivo"
                >
                  📎
                </Button>
                
                {/* Gravador de áudio */}
                <AudioRecorder onRecordingComplete={handleAudioRecording} />
                
                {/* Gravador de vídeo */}
                <VideoRecorder onRecordingComplete={handleVideoRecording} />

                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: theme.spacing.md,
                    background: theme.colors.background,
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.full,
                    fontSize: theme.fonts.sizes.md,
                    outline: 'none',
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    borderRadius: theme.borderRadius.full,
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  🍾 Enviar
                </Button>
              </form>
            </>
          ) : (
            /* Tela vazia - Nenhum contato selecionado */
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary,
            }}>
              <p style={{ fontSize: theme.fonts.sizes.lg }}>Selecione um contato para conversar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Button, Input, Badge } from '../components/BaseComponents'
import { WhatsAppSync } from '../components/WhatsAppSync'
import { MiniAnuncio } from '../components/MiniAnuncio'
import { ExoclickAd } from '../components/ExoclickAd'
import { useCDCoin, CDCoinDisplay } from '../hooks/useCDCoin'
import { theme } from '../styles/theme'
import { playMessageSound, playBottleSound } from '../utils/sounds'
import { getMessages, sendMessage as sendApiMessage, getOceanoMessages, getContacts, uploadFile } from '../services/api'
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

// Componente Garrafa Visual - HORIZONTAL (boiando no mar)
function Bottle({ message, onClick, index, isOpened, onDragAway }) {
  const isOwn = message.sender === 'me'
  // Rotação leve para simular boiando na água
  const tilt = -15 + (index % 5) * 8 // entre -15 e +17 graus
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true)
      setDragStartX(e.clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX
      // Drag threshold to trigger removal
      if (Math.abs(deltaX) > 100) {
        onDragAway && onDragAway(message.id)
        setIsDragging(false)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStartX])

  return (
    <div
      onClick={onClick}
      onMouseDown={handleMouseDown}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: isDragging ? 'none' : 'transform 0.3s ease',
      }}
      onMouseEnter={e => { if (!isDragging) e.currentTarget.style.transform = 'scale(1.15)' }}
      onMouseLeave={e => { if (!isDragging) e.currentTarget.style.transform = 'scale(1)' }}
    >
      {/* Garrafa deitada (horizontal) */}
      <div
        style={{
          width: '120px',
          height: '55px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          transform: `rotate(${tilt}deg)`,
        }}
      >
        {/* Marcador de estado (bolinha verde/vermelha) */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: isOpened ? '#ff4444' : '#4ade80',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 10,
        }} />
        
        {/* Corpo da garrafa (horizontal) */}
        <div
          style={{
            width: '70px',
            height: '42px',
            background: isOwn
              ? 'linear-gradient(90deg, #004a99, #0066cc)'
              : 'linear-gradient(90deg, #0d2a42, #1a4d6d)',
            borderRadius: '16px 6px 6px 16px',
            border: `2px solid ${theme.colors.secondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0,163,255,0.3)',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: '18px' }}>
            {message.mediaType === 'image' ? '🖼️' :
             message.mediaType === 'audio' ? '🎵' :
             message.mediaType === 'file' ? '📄' : '📜'}
          </span>
          {/* Brilho */}
          <div style={{
            position: 'absolute', top: '4px', left: '8px',
            width: '20px', height: '6px',
            background: 'rgba(255,255,255,0.15)', borderRadius: '3px',
          }} />
        </div>
        {/* Gargalo (horizontal) */}
        <div style={{
          width: '22px', height: '16px',
          background: isOwn ? '#4ade80' : '#1a4d6d',
          border: `1px solid ${theme.colors.secondary}`,
          borderRadius: '0 3px 3px 0',
        }} />
        {/* Cortiça (horizontal) */}
        <div style={{
          width: '12px', height: '18px',
          background: '#c4956a',
          borderRadius: '2px 4px 4px 2px',
        }} />
      </div>

      {/* Info abaixo */}
      <p style={{
        fontSize: theme.fonts.sizes.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
        textAlign: 'center', maxWidth: '90px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {isOwn ? 'Você' : message.senderName}
      </p>
      <p style={{ fontSize: '10px', color: theme.colors.secondary, marginTop: '2px' }}>
        {isOpened ? 'Aberto' : 'Clique para abrir'}
      </p>
    </div>
  )
}

// Componente Barril de Madeira - para vídeos (Estilo Pirata com Imagem)
function Barrel({ message, onClick, index, isOpened, onDragAway }) {
  const isOwn = message.sender === 'me'
  // Rotação leve para simular boiando na água (horizontal)
  const tilt = -15 + (index % 5) * 8 // entre -15 e +17 graus
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true)
      setDragStartX(e.clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX
      // Drag threshold to trigger removal
      if (Math.abs(deltaX) > 100) {
        onDragAway && onDragAway(message.id)
        setIsDragging(false)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStartX])

  return (
    <div
      onClick={onClick}
      onMouseDown={handleMouseDown}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: isDragging ? 'none' : 'transform 0.3s ease',
      }}
      onMouseEnter={e => { if (!isDragging) e.currentTarget.style.transform = 'scale(1.15)' }}
      onMouseLeave={e => { if (!isDragging) e.currentTarget.style.transform = 'scale(1)' }}
    >
      {/* Barril deitado (horizontal) */}
      <div
        style={{
          width: '180px',
          height: '90px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          transform: `rotate(${tilt}deg)`,
        }}
      >
        {/* Marcador de estado (bolinha verde/vermelha) */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: isOpened ? '#ff4444' : '#4ade80',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 10,
        }} />
        {/* Corpo do barril - CSS puro (funciona sem imagem) */}
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
          {/* Imagem do barril */}
          <img 
            src="/img/barril.png"
            alt="Barril de vídeo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isOwn 
                ? 'drop-shadow(0 0 12px rgba(74,222,128,0.5)) brightness(1.1)'
                : 'drop-shadow(0 0 12px rgba(139,105,20,0.5))',
            }}
            onError={(e) => {
              console.error('ERRO ao carregar barril.png no Chat!', e)
              console.log('Tentando carregar de:', e.target.src)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
            onLoad={() => console.log('✅ Barril.png carregado com sucesso no Chat!')}
          />
          
          {/* Barril CSS (fallback se imagem não carregar) */}
          <div style={{
            display: 'none',
            width: '100%',
            height: '100%',
            background: isOwn
              ? 'linear-gradient(90deg, #8B6914 0%, #A0782C 20%, #C49A3C 50%, #A0782C 80%, #8B6914 100%)'
              : 'linear-gradient(90deg, #6B4F10 0%, #8B6914 20%, #A0782C 50%, #8B6914 80%, #6B4F10 100%)',
            borderRadius: '30px',
            border: '3px solid #4A3008',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}>
            {/* Aros de metal */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '0',
              bottom: '0',
              width: '6px',
              background: 'linear-gradient(180deg, #666, #999, #666)',
              borderRadius: '3px',
            }} />
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '0',
              bottom: '0',
              width: '6px',
              background: 'linear-gradient(180deg, #666, #999, #666)',
              borderRadius: '3px',
            }} />
          </div>
        </div>
      </div>

      {/* Nome abaixo do barril */}
      <p style={{
        fontSize: theme.fonts.sizes.xs,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
        textAlign: 'center', maxWidth: '100px',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {isOwn ? 'Você' : message.senderName}
      </p>
      <p style={{ fontSize: '10px', color: '#A0782C', marginTop: '2px' }}>
        🛢️ Clique para abrir
      </p>
    </div>
  )
}

// Modal para abrir Garrafa ou Barril
function BottleModal({ message, onClose }) {
  const isOwn = message.sender === 'me'
  const isBarrel = message.mediaType === 'video'

  // Fechar com tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 0.3s ease',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: isBarrel 
            ? 'linear-gradient(135deg, #2C1810 0%, #4A2F1D 50%, #2C1810 100%)'
            : theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          maxWidth: '500px', width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: isBarrel ? '3px solid #A0782C' : `2px solid ${theme.colors.secondary}`,
          boxShadow: isBarrel 
            ? '0 0 30px rgba(139,105,20,0.6), inset 0 0 50px rgba(0,0,0,0.3)'
            : theme.shadows.glow,
          animation: 'scaleUp 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Botão X para fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: isBarrel ? '#FFD700' : theme.colors.text,
            fontSize: '28px',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: '1',
            zIndex: 10,
          }}
        >
          ✕
        </button>
        {/* Ícone */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
          <span style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
            {isBarrel ? '🛢️' : '🍾'}
          </span>
        </div>

        {/* Remetente */}
        <div style={{
          textAlign: 'center', marginBottom: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          borderBottom: `1px solid ${isBarrel ? '#A0782C' : theme.colors.border}`,
        }}>
          <p style={{ fontWeight: 'bold', fontSize: theme.fonts.sizes.lg, color: isBarrel ? '#FFD700' : theme.colors.text }}>
            {isBarrel ? '🎬 Barril Pirata' : '📜 Mensagem'} de {isOwn ? 'Você' : (message.senderName || 'Desconhecido')}
          </p>
          <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
            {message.time}
          </p>
        </div>

        {/* Anúncio Exoclick */}
        <ExoclickAd />

        {/* Conteúdo */}
        <div style={{
          background: isBarrel ? 'rgba(0,0,0,0.4)' : theme.colors.background,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.lg,
          minHeight: '80px',
          border: isBarrel ? '1px solid rgba(160,120,44,0.3)' : 'none',
        }}>
          <p style={{ fontSize: theme.fonts.sizes.md, lineHeight: 1.6 }}>
            {message.text}
          </p>

          {/* Imagem */}
          {message.mediaUrl && message.mediaType === 'image' && (
            <img src={message.mediaUrl} alt="arquivo" style={{
              maxWidth: '100%', borderRadius: theme.borderRadius.md, marginTop: theme.spacing.md,
            }} />
          )}
          {/* Vídeo (do barril) */}
          {message.mediaUrl && message.mediaType === 'video' && (
            <video src={message.mediaUrl} controls style={{
              maxWidth: '100%', borderRadius: theme.borderRadius.md, marginTop: theme.spacing.md,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }} />
          )}
          {/* Áudio */}
          {message.mediaUrl && message.mediaType === 'audio' && (
            <audio src={message.mediaUrl} controls style={{
              width: '100%', marginTop: theme.spacing.md,
            }} />
          )}
          {/* Arquivo */}
          {message.mediaUrl && message.mediaType === 'file' && (
            <div style={{
              marginTop: theme.spacing.md, padding: theme.spacing.md,
              background: isBarrel ? 'rgba(139,105,20,0.2)' : theme.colors.surface, 
              borderRadius: theme.borderRadius.md, textAlign: 'center',
              border: isBarrel ? '1px solid rgba(160,120,44,0.3)' : 'none',
            }}>
              <p>📄 {message.fileName || 'Arquivo anexado'}</p>
            </div>
          )}
        </div>

        <Button 
          variant={isBarrel ? 'primary' : 'secondary'} 
          onClick={onClose} 
          style={{ 
            width: '100%',
            background: isBarrel ? 'linear-gradient(90deg, #8B6914, #A0782C)' : undefined,
          }}
        >
          {isBarrel ? '🛢️ Fechar Barril Pirata' : '🍾 Fechar Garrafa'}
        </Button>
      </div>
    </div>
  )
}

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

export function Chat({ oceanoMode }) {
  const { user, logout } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState({}) // REMOVIDO: mockMessages - agora vem do banco
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBottle, setSelectedBottle] = useState(null)
  const [oceanoText, setOceanoText] = useState('')
  const [showContactsOnMobile, setShowContactsOnMobile] = useState(true)
  const [contacts, setContacts] = useState([]) // REMOVIDO: mockContacts - agora vem do banco
  const [oceanoBottles, setOceanoBottles] = useState([]) // REMOVIDO: dados mockados - agora vem do banco
  const [loading, setLoading] = useState(true)
  const [showWhatsAppSync, setShowWhatsAppSync] = useState(false)
  const [showMiniAnuncio, setShowMiniAnuncio] = useState(false)
  const [openedBottles, setOpenedBottles] = useState(new Set()) // Track opened bottles
  const { saldo, pontuar, adicionarPontos } = useCDCoin()
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const oceanoFileRef = useRef(null)
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
        // Carregar mensagens REAIS do oceano
        const oceanoMessages = await getOceanoMessages()
        console.log(`🌊 ${oceanoMessages.length} mensagens do oceano carregadas`)
        setOceanoBottles(oceanoMessages.map(msg => ({
          ...msg,
          sender: msg.sender_id === user?.id ? 'me' : 'them',
          senderName: msg.sender_name || 'Usuário',
          time: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          mediaType: msg.media_type,  // ← Importante para vídeo → barril
          mediaUrl: msg.media_url,    // ← URL da mídia
        })))

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
      // Som de garrafa quando recebe nova mensagem
      playBottleSound()
      
      if (message.is_oceano) {
        // Adicionar às garrafas do oceano
        setOceanoBottles(prev => [{
          ...message,
          sender: message.sender_id === user?.id ? 'me' : 'them',
          senderName: message.sender_name || 'Usuário',
          time: new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }, ...prev])
      } else if (selectedChat && (message.sender_id === selectedChat.id || message.receiver_id === selectedChat.id)) {
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

  // Posições aleatórias para garrafas no oceano (estável, bem espalhadas)
  const bottlePositions = useMemo(() => {
    const positions = []
    const count = 20
    for (let i = 0; i < count; i++) {
      // Grid com jitter para espalhar bem
      const cols = 5
      const col = i % cols
      const row = Math.floor(i / cols)
      const cellW = 85 / cols  // largura de cada célula
      const cellH = 75 / 4     // altura de cada célula
      positions.push({
        left: `${4 + col * cellW + Math.random() * (cellW * 0.6)}%`,
        top: `${3 + row * cellH + Math.random() * (cellH * 0.5)}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${3 + Math.random() * 3}s`,
      })
    }
    return positions
  }, [])

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
        // Enviar para o oceano
        const newBottle = {
          sender_id: user?.id,
          text: mediaType === 'video' ? `🛢️ ${file.name}` : `📎 ${file.name}`,
          media_url: mediaUrl,
          media_type: mediaType,
          file_name: file.name,
          is_oceano: true,
        }
        
        const savedMessage = await sendApiMessage(newBottle)
        
        const localBottle = {
          id: savedMessage.id,
          sender: 'me',
          senderName: user?.name || 'Você',
          text: mediaType === 'video' ? `🛢️ ${file.name}` : `📎 ${file.name}`,
          time: timeStr,
          mediaUrl: mediaUrl,
          mediaType: mediaType,
        }
        
        setOceanoBottles(prev => [localBottle, ...prev])
        playBottleSound() // Som no oceano
      }
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error)
      alert('Erro ao enviar arquivo: ' + (error.response?.data?.error || error.message))
    }

    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (audioInputRef.current) audioInputRef.current.value = ''
    if (oceanoFileRef.current) oceanoFileRef.current.value = ''
  }

  const handleOceanoSend = async (e) => {
    e.preventDefault()
    if (!oceanoText.trim()) return

    try {
      const newBottle = {
        sender_id: user?.id,
        text: oceanoText.trim(),
        is_oceano: true,
      }

      // Enviar para API
      const savedMessage = await sendApiMessage(newBottle)

      const localBottle = {
        id: savedMessage.id,
        sender: 'me',
        senderName: user?.name || 'Você',
        text: oceanoText.trim(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }

      setOceanoBottles(prev => [localBottle, ...prev])
      setOceanoText('')
      
      // Tocar som de garrafa no oceano
      playBottleSound()
    } catch (error) {
      console.error('Erro ao enviar garrafa:', error)
      alert('Erro ao enviar para o oceano: ' + (error.response?.data?.error || error.message))
    }
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
        // Enviar para o oceano
        const savedMessage = await sendApiMessage({
          sender_id: user?.id,
          text: '🎤 Áudio gravado',
          media_url: mediaUrl,
          media_type: 'audio',
          file_name: 'audio_gravado.webm',
          is_oceano: true,
        })
        
        const localBottle = {
          id: savedMessage.id,
          sender: 'me',
          senderName: user?.name || 'Você',
          text: '🎤 Áudio gravado',
          time: timeStr,
          mediaUrl: mediaUrl,
          mediaType: 'audio',
        }
        
        setOceanoBottles(prev => [localBottle, ...prev])
        playBottleSound() // Som de garrafa no oceano
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
        // Enviar para o oceano
        const savedMessage = await sendApiMessage({
          sender_id: user?.id,
          text: '🎥 Vídeo gravado',
          media_url: mediaUrl,
          media_type: 'video',
          file_name: 'video_gravado.webm',
          is_oceano: true,
        })
        
        const localBottle = {
          id: savedMessage.id,
          sender: 'me',
          senderName: user?.name || 'Você',
          text: '🎥 Vídeo gravado',
          time: timeStr,
          mediaUrl: mediaUrl,
          mediaType: 'video',
        }
        
        setOceanoBottles(prev => [localBottle, ...prev])
        playBottleSound() // Som de barril no oceano
      }
    } catch (error) {
      console.error('❌ Erro ao enviar vídeo:', error)
      alert('Erro ao enviar vídeo: ' + (error.response?.data?.error || error.message))
    }
  }

  // Handler para remover garrafa ao arrastar para o lado
  const handleDragAway = (bottleId) => {
    setOceanoBottles(prev => prev.filter(bottle => bottle.id !== bottleId))
    setOpenedBottles(prev => {
      const newSet = new Set(prev)
      newSet.delete(bottleId)
      return newSet
    })
  }

  // Função para renderizar Bottle ou Barrel
  const renderFloatingItem = (msg, idx) => {
    const pos = bottlePositions[idx % bottlePositions.length]
    const isVideo = msg.mediaType === 'video' || msg.media_type === 'video'
    const Component = isVideo ? Barrel : Bottle
    return (
      <div
        key={msg.id}
        style={{
          position: 'absolute',
          left: pos.left,
          top: pos.top,
          animation: `float ${pos.duration} ease-in-out infinite`,
          animationDelay: pos.delay,
          zIndex: 1,
        }}
      >
        <Component
          message={msg}
          index={idx}
          isOpened={openedBottles.has(msg.id)}
          onDragAway={handleDragAway}
          onClick={() => {
            setSelectedBottle(msg)
            // Marcar como aberto
            setOpenedBottles(prev => new Set([...prev, msg.id]))
            // Mostrar anúncio e dar pontos
            setShowMiniAnuncio(true)
            if (isVideo) {
              pontuar.videoAssistido()
            } else {
              pontuar.mensagemAberta()
            }
          }}
        />
      </div>
    )
  }

  // Componente para renderizar oceano com garrafas espalhadas
  const OceanView = ({ bottles, showInput }) => (
    <div style={{
      flex: 1,
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 20% 80%, rgba(0,102,204,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(0,163,255,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 100%, rgba(0,102,204,0.2) 0%, transparent 60%),
        ${theme.colors.background}
      `,
    }}>
      {/* Área das garrafas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
        {/* Ondas decorativas */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to top, rgba(0,102,204,0.1), transparent)',
          pointerEvents: 'none',
        }} />

        {bottles.map((msg, idx) => renderFloatingItem(msg, idx))}
      </div>

      {/* Input fixo no fundo */}
      {showInput && (
        <div className="chat-input-bar" style={{
          padding: theme.spacing.sm,
          background: 'linear-gradient(to top, rgba(26,47,77,0.97), rgba(26,47,77,0.9))',
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          gap: theme.spacing.xs,
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          <input
            type="file"
            ref={oceanoFileRef}
            accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.avi,.mp3,.wav,.ogg,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => oceanoFileRef.current?.click()}
            style={{ borderRadius: theme.borderRadius.full, padding: `${theme.spacing.xs} ${theme.spacing.sm}`, fontSize: theme.fonts.sizes.sm }}
          >
            📎
          </Button>
          
          {/* Gravador de áudio no Oceano */}
          <AudioRecorder onRecordingComplete={handleAudioRecording} />
          
          {/* Gravador de vídeo no Oceano */}
          <VideoRecorder onRecordingComplete={handleVideoRecording} />
          
          <input
            type="text"
            value={oceanoText}
            onChange={e => setOceanoText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleOceanoSend(e)
              }
            }}
            placeholder="Jogue uma garrafa no oceano..."
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
            onClick={handleOceanoSend}
            variant="primary"
            style={{
              borderRadius: theme.borderRadius.full,
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              whiteSpace: 'nowrap',
            }}
          >
            🍾 Jogar Garrafa
          </Button>
        </div>
      )}
    </div>
  )

  // MODO OCEANO - Tela cheia com garrafas coletivas
  if (oceanoMode) {
    return (
      <div style={{ height: 'calc(100vh - 60px)', background: theme.colors.background, display: 'flex', flexDirection: 'column' }}>
        <Header>
          <h1 style={{ fontSize: theme.fonts.sizes.xl }}>🌊 Oceano</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CDCoinDisplay 
              saldo={saldo} 
              onConvertClick={() => alert('Em breve: tela de conversão de CDCOIN!')}
            />
            <Button variant="secondary" onClick={logout}>Sair</Button>
          </div>
        </Header>
        <OceanView bottles={oceanoBottles} showInput />
        
        {/* Mini-anuncio no Oceano */}
        {showMiniAnuncio && (
          <MiniAnuncio onClose={() => {
            setShowMiniAnuncio(false)
            pontuar.anuncioAssistido()
          }} />
        )}
        
        {selectedBottle && (
          <BottleModal message={selectedBottle} onClose={() => {
            setSelectedBottle(null)
            // Pontuar ao fechar modal
            if (selectedBottle.mediaType === 'video') {
              pontuar.oceanoParticipou()
            }
          }} />
        )}
      </div>
    )
  }

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

      {/* Mini-anuncio */}
      {showMiniAnuncio && (
        <MiniAnuncio onClose={() => {
          setShowMiniAnuncio(false)
          pontuar.anuncioAssistido()
        }} />
      )}

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

              {/* Área das Garrafas - Oceano */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                position: 'relative',
                background: `
                  radial-gradient(ellipse at 30% 70%, rgba(0,102,204,0.12) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 30%, rgba(0,163,255,0.08) 0%, transparent 50%),
                  ${theme.colors.background}
                `,
              }}>
                {chatMessages.length === 0 ? (
                  <div style={{
                    width: '100%',
                    textAlign: 'center',
                    color: theme.colors.textSecondary,
                    paddingTop: theme.spacing.xxl,
                  }}>
                    <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>🌊</p>
                    <p>Nenhuma garrafa ainda. Envie a primeira!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => renderFloatingItem(msg, idx))
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
            /* Tela vazia - Oceano com garrafas */
            <OceanView bottles={oceanoBottles} showInput={false} />
          )}
        </div>
      </div>

      {/* Modal da Garrafa */}
      {selectedBottle && (
        <BottleModal
          message={selectedBottle}
          onClose={() => setSelectedBottle(null)}
        />
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'
import { AudioRecorder, VideoRecorder } from '../components/AudioVideoRecorder'
import { playBottleSound } from '../utils/sounds'
import { MiniAnuncio } from '../components/MiniAnuncio'
import { ExoclickAd } from '../components/ExoclickAd'
import { TestExoclickAd } from '../components/TestExoclickAd'
import { getOceanoMessages, sendMessage as sendApiMessage, uploadFile } from '../services/api'
import { io } from 'socket.io-client'

export function Status() {
  const { user, logout } = useAuth()
  const [mode, setMode] = useState('view') // view ou create
  const [statusForm, setStatusForm] = useState({ text: '', mediaUrl: '', mediaType: '' })
  const [selectedStatus, setSelectedStatus] = useState(null) // Status selecionado para abrir
  const [showAnuncio, setShowAnuncio] = useState(false) // Controla exibição de anúncio
  const [statuses, setStatuses] = useState([]) // REMOVIDO: dados mockados - agora vem do banco
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false) // Loading do botão publicar
  const socketRef = useRef(null)

  // Carregar status REAIS do banco de dados
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        // Buscar mensagens do oceano (is_oceano = true)
        const oceanoMessages = await getOceanoMessages()
        
        // Transformar em formato de status
        const realStatuses = oceanoMessages.map(msg => ({
          id: msg.id,
          author: msg.sender_name || 'Usuário',
          avatar: msg.sender_avatar || '👤',
          content: msg.text,
          type: msg.media_type === 'video' ? 'video' : 'text',
          mediaUrl: msg.media_url,
          mediaType: msg.media_type,
          timestamp: new Date(msg.created_at).toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit',
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          views: msg.views || 0,
          likes: msg.likes || 0,
          liked: false,
          sender_id: msg.sender_id,
        }))
        
        setStatuses(realStatuses)
        setLoading(false)
      } catch (error) {
        console.error('❌ Erro ao carregar status:', error)
        setLoading(false)
      }
    }

    loadStatuses()
  }, [])

  // Configurar WebSocket para receber mensagens do oceano em tempo real
  useEffect(() => {
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : window.location.origin
    
    socketRef.current = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
    })
    
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket conectado no Status!')
    })
    
    socketRef.current.on('connect_error', (err) => {
      console.log('⚠️ WebSocket não conectado no Status:', err.message)
    })
    
    socketRef.current.on('new_message', (message) => {
      // Processar apenas mensagens do oceano (is_oceano = true)
      if (!message.is_oceano) {
        return // Ignorar mensagens privadas
      }
      
      // Som de garrafa quando recebe novo status
      playBottleSound()
      
      // Adicionar novo status ao topo da lista
      const newStatus = {
        id: message.id,
        author: message.sender_name || 'Usuário',
        avatar: message.sender_avatar || '👤',
        content: message.text,
        type: message.media_type === 'video' ? 'video' : 'text',
        mediaUrl: message.media_url,
        mediaType: message.media_type,
        timestamp: new Date(message.created_at).toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        views: message.views || 0,
        likes: message.likes || 0,
        liked: false,
        sender_id: message.sender_id,
      }
      
      setStatuses(prev => [newStatus, ...prev])
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const handleCreateStatus = async (e) => {
    e.preventDefault()
    console.log('🔵 Tentando publicar status...')
    console.log('📝 Formulário:', statusForm)
    console.log('👤 Usuário:', user)
    
    if (!statusForm.text.trim() && !statusForm.mediaUrl) {
      console.log('❌ Formulário vazio')
      return
    }

    setPublishing(true) // Inicia loading

    try {
      let mediaUrlFinal = statusForm.mediaUrl
      
      // Se tem mídia gravada (blob), fazer upload para o servidor
      if (statusForm.mediaUrl && statusForm.mediaUrl.startsWith('blob:')) {
        console.log('📤 Fazendo upload da mídia...')
        try {
          // Converter blob URL para File
          const response = await fetch(statusForm.mediaUrl)
          const blob = await response.blob()
          
          // Criar arquivo
          const extension = statusForm.mediaType === 'video' ? 'webm' : 'webm'
          const fileName = `status_${user?.id}_${Date.now()}.${extension}`
          const file = new File([blob], fileName, { type: blob.type })
          
          // Upload do arquivo
          const uploadResult = await uploadFile(file)
          if (uploadResult.filename) {
            mediaUrlFinal = `/uploads/${uploadResult.filename}`
            console.log('✅ Mídia enviada para o servidor:', mediaUrlFinal)
          }
        } catch (error) {
          console.error('❌ Erro ao fazer upload da mídia:', error)
          // Continua mesmo sem upload - usa URL temporária
        }
      }
      
      console.log('📡 Enviando para API...')
      // Enviar status REAL para o banco de dados
      const newMessage = await sendApiMessage({
        sender_id: user?.id,
        text: statusForm.text,
        media_url: mediaUrlFinal,
        media_type: statusForm.mediaType,
        is_oceano: true, // Status é público (oceano)
      })
      
      console.log('✅ API respondeu:', newMessage)

      // Adicionar ao estado local
      const newStatus = {
        id: newMessage.id,
        author: user?.name || 'Você',
        avatar: user?.avatar || '👤',
        content: statusForm.text,
        type: statusForm.mediaType === 'video' ? 'video' : 'text',
        mediaUrl: mediaUrlFinal,
        mediaType: statusForm.mediaType,
        timestamp: 'agora',
        views: 0,
        likes: 0,
        liked: false,
        sender_id: user?.id,
      }

      console.log('✅ Status criado localmente:', newStatus)

      setStatuses([newStatus, ...statuses])
      setStatusForm({ text: '', mediaUrl: '', mediaType: '' })
      setMode('view')
      playBottleSound()
      
      console.log('✅ Status publicado com sucesso!')
      alert('✅ Status publicado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao criar status:', error)
      console.error('❌ Detalhes:', error.response?.data || error.message)
      alert('Erro ao publicar status: ' + (error.response?.data?.error || error.message))
    } finally {
      setPublishing(false) // Finaliza loading
    }
  }

  const handleLike = (statusId) => {
    setStatuses(statuses.map(status => {
      if (status.id === statusId) {
        return {
          ...status,
          liked: !status.liked,
          likes: status.liked ? status.likes - 1 : status.likes + 1
        }
      }
      return status
    }))
  }

  const handleAudioRecording = async (audioData) => {
    // audioData = { url, blob, type }
    const audioUrl = audioData.url || audioData
    setStatusForm({
      ...statusForm,
      mediaUrl: audioUrl,
      mediaType: 'audio'
    })
  }

  const handleVideoRecording = async (videoData) => {
    // videoData = { url, blob, type }
    const videoUrl = videoData.url || videoData
    setStatusForm({
      ...statusForm,
      mediaUrl: videoUrl,
      mediaType: 'video'
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Componente Garrafa (HORIZONTAL - boiando no mar)
  const BottleIcon = ({ isOwn }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        transform: 'rotate(90deg)', // Horizontal
      }}>
        {/* Corpo da garrafa */}
        <div style={{
          width: '50px',
          height: '80px',
          background: isOwn ? '#4ade80' : '#1a4d6d',
          border: `2px solid ${theme.colors.secondary}`,
          borderRadius: '8px 8px 20px 20px',
          position: 'relative',
        }} />
        {/* Gargalo */}
        <div style={{
          width: '20px',
          height: '30px',
          background: isOwn ? '#4ade80' : '#1a4d6d',
          border: `2px solid ${theme.colors.secondary}`,
          borderRadius: '4px 4px 0 0',
          position: 'absolute',
          top: '-30px',
          left: '15px',
        }} />
      </div>
    </div>
  )

  // Componente Barril (HORIZONTAL - boiando no mar)
  const BarrelIcon = ({ isOwn }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <img 
        src="/img/barril.png" 
        alt="Barril de vídeo"
        style={{
          width: '180px',
          height: '90px',
          objectFit: 'contain',
          filter: isOwn 
            ? 'drop-shadow(0 0 12px rgba(74,222,128,0.5)) brightness(1.1)'
            : 'drop-shadow(0 0 12px rgba(139,105,20,0.5))',
        }}
        onError={(e) => {
          console.log('Erro ao carregar barril.png no Status')
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
        onLoad={() => console.log('Barril carregado no Status!')}
      />
      <div style={{
        display: 'none',
        width: '120px',
        height: '60px',
        background: 'linear-gradient(90deg, #8B6914, #A0782C, #8B6914)',
        borderRadius: '30px',
        position: 'relative',
        border: '3px solid #4A3008',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}>
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
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Header>
        <h1 style={{ fontSize: theme.fonts.sizes.xl }}>🌊 Status • Garrafas no Mar</h1>
        <Button variant="secondary" onClick={logout}>
          Sair
        </Button>
      </Header>

      <Container style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>⏳</p>
            <p style={{ color: theme.colors.textSecondary }}>Carregando status...</p>
          </div>
        ) : mode === 'view' ? (
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: theme.spacing.lg,
              }}
            >
              {statuses.length === 0 ? (
                <div style={{ 
                  gridColumn: '1 / -1',
                  textAlign: 'center', 
                  padding: theme.spacing.xl,
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                }}>
                  <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>🌊</p>
                  <p style={{ fontSize: theme.fonts.sizes.lg, marginBottom: theme.spacing.sm }}>
                    <strong>Nenhum status publicado ainda</strong>
                  </p>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Seja o primeiro a postar! Clique em "Criar Novo Status" acima.
                  </p>
                </div>
              ) : (
                statuses.map((status, idx) => (
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
                          overflow: 'hidden',
                        }}
                      >
                        {status.avatar && (status.avatar.startsWith('http') || status.avatar.startsWith('/')) ? (
                          <img 
                            src={status.avatar} 
                            alt={status.author}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <span>{status.avatar || '👤'}</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{status.author}</p>
                        <p style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary }}>
                          {status.timestamp}
                        </p>
                      </div>
                    </div>

                    {/* Conteúdo - Garrafa ou Barril */}
                    <div
                      style={{
                        background: theme.colors.background,
                        padding: theme.spacing.md,
                        borderRadius: theme.borderRadius.md,
                        marginBottom: theme.spacing.md,
                        minHeight: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {status.type === 'video' ? (
                        <>
                          <div 
                            onClick={() => {
                              setSelectedStatus(status)
                              playBottleSound()
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <BarrelIcon isOwn={status.author === user?.name} />
                          </div>
                          <p style={{ fontSize: theme.fonts.sizes.sm, textAlign: 'center', marginTop: '8px' }}>
                            🛢️ {status.content || 'Vídeo no barril'}
                          </p>
                        </>
                      ) : status.mediaType === 'audio' ? (
                        <>
                          <div 
                            onClick={() => {
                              setSelectedStatus(status)
                              playBottleSound()
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <BottleIcon isOwn={status.author === user?.name} />
                          </div>
                          <p style={{ fontSize: theme.fonts.sizes.sm, textAlign: 'center', marginTop: '8px' }}>
                            🍾 🎤 Áudio na garrafa
                          </p>
                          {/* Áudio NÃO fica visível na lista - só abre no modal */}
                        </>
                      ) : (
                        <>
                          <div 
                            onClick={() => {
                              setSelectedStatus(status)
                              playBottleSound()
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <BottleIcon isOwn={status.author === user?.name} />
                          </div>
                          <p style={{ fontSize: theme.fonts.sizes.md, textAlign: 'center', marginTop: '8px' }}>
                            🍾 {status.content}
                          </p>
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                      <Badge variant="success">👁️ {status.views}</Badge>
                      <Button
                        variant="secondary"
                        style={{ flex: 1 }}
                        onClick={() => handleLike(status.id)}
                      >
                        {status.liked ? '❤️ Curtido' : '🤍 Curtir'} {status.likes > 0 ? status.likes : ''}
                      </Button>
                    </div>
                  </Card>
                </div>
              ))
              )}
            </div>

            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </>
        ) : (
          <Card style={{ 
            maxWidth: '500px', 
            margin: '0 auto',
            maxHeight: '90vh',
            overflowY: 'auto',
            paddingBottom: theme.spacing.xl,
          }}>
            <h2 style={{ marginBottom: theme.spacing.lg }}>Criar Novo Status 🍾</h2>

            <form onSubmit={handleCreateStatus}>
              <Input
                label="Seu Status"
                as="textarea"
                value={statusForm.text}
                onChange={e => setStatusForm({ ...statusForm, text: e.target.value })}
                placeholder="Compartilhe um momento..."
                rows={3}
                style={{ 
                  fontFamily: theme.fonts.family.base,
                  minHeight: '80px',
                  fontSize: theme.fonts.sizes.md,
                }}
              />

              {/* Preview do mídia */}
              {statusForm.mediaUrl && (
                <div style={{ marginBottom: theme.spacing.md }}>
                  {statusForm.mediaType === 'video' ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, background: theme.colors.background, borderRadius: theme.borderRadius.md, minHeight: '150px' }}>
                      <p style={{ fontSize: '60px', marginBottom: theme.spacing.md }}>🛢️</p>
                      <p style={{ fontSize: theme.fonts.sizes.md, color: theme.colors.textSecondary }}>Vídeo gravado (barril)</p>
                    </div>
                  ) : statusForm.mediaType === 'audio' ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, background: theme.colors.background, borderRadius: theme.borderRadius.md, minHeight: '150px' }}>
                      <p style={{ fontSize: '60px', marginBottom: theme.spacing.md }}>🍾</p>
                      <p style={{ fontSize: theme.fonts.sizes.md, color: theme.colors.textSecondary }}>Áudio gravado (garrafa)</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Gravadores */}
              <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <AudioRecorder onRecordingComplete={handleAudioRecording} />
                <VideoRecorder onRecordingComplete={handleVideoRecording} />
              </div>

              {/* Botão de Publicar Anúncio */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAnuncio(true)}
                  style={{ 
                    width: '100%',
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    fontSize: theme.fonts.sizes.md,
                  }}
                >
                  📺 Ver Anúncio (ganhe CDCOINs)
                </Button>
              </div>

              <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={publishing}
                  style={{ 
                    flex: 1,
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    fontSize: theme.fonts.sizes.lg,
                    background: publishing ? '#999' : theme.colors.primary,
                    cursor: publishing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {publishing ? '⏳ Publicando...' : '📤 Publicar'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode('view')
                    setStatusForm({ text: '', mediaUrl: '', mediaType: '' })
                  }}
                  disabled={publishing}
                  style={{ 
                    flex: 1,
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    fontSize: theme.fonts.sizes.lg,
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
      </Container>

      {/* Modal de Anúncio */}
      {showAnuncio && (
        <MiniAnuncio onClose={() => setShowAnuncio(false)} />
      )}

      {/* Modal de Status - Abre garrafa/barril ao clicar */}
      {selectedStatus && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedStatus(null)}
        >
          <div
            style={{
              background: theme.colors.background,
              borderRadius: theme.borderRadius.lg,
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: theme.spacing.lg,
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setSelectedStatus(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '18px',
                color: theme.colors.text,
              }}
            >
              ✕
            </button>

            {/* Header do status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ 
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: theme.colors.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                overflow: 'hidden',
              }}>
                {selectedStatus.avatar && (selectedStatus.avatar.startsWith('http') || selectedStatus.avatar.startsWith('/')) ? (
                  <img 
                    src={selectedStatus.avatar} 
                    alt={selectedStatus.author}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span>{selectedStatus.avatar || '👤'}</span>
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, color: theme.colors.text }}>{selectedStatus.author}</h3>
                <p style={{ margin: 0, fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                  {selectedStatus.timestamp}
                </p>
              </div>
            </div>

            {/* Anúncio Exoclick */}
            <ExoclickAd />

            {/* Conteúdo */}
            <div style={{ marginBottom: '16px' }}>
              {selectedStatus.type === 'video' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BarrelIcon isOwn={selectedStatus.author === user?.name} />
                  </div>
                  {selectedStatus.mediaUrl ? (
                    <video controls style={{ width: '100%', borderRadius: theme.borderRadius.md }}>
                      <source src={selectedStatus.mediaUrl} />
                    </video>
                  ) : (
                    <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
                      🛢️ {selectedStatus.content || 'Vídeo no barril'}
                    </p>
                  )}
                </>
              ) : selectedStatus.mediaType === 'audio' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BottleIcon isOwn={selectedStatus.author === user?.name} />
                  </div>
                  {selectedStatus.mediaUrl && (
                    <audio controls style={{ width: '100%' }}>
                      <source src={selectedStatus.mediaUrl} />
                    </audio>
                  )}
                </>
              ) : selectedStatus.mediaType === 'image' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BottleIcon isOwn={selectedStatus.author === user?.name} />
                  </div>
                  <img 
                    src={selectedStatus.mediaUrl} 
                    alt={selectedStatus.content}
                    style={{ width: '100%', borderRadius: theme.borderRadius.md }}
                  />
                  {selectedStatus.content && (
                    <p style={{ marginTop: '12px', color: theme.colors.text }}>
                      🍾 {selectedStatus.content}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BottleIcon isOwn={selectedStatus.author === user?.name} />
                  </div>
                  <p style={{ textAlign: 'center', fontSize: theme.fonts.sizes.lg, color: theme.colors.text }}>
                    🍾 {selectedStatus.content}
                  </p>
                </>
              )}
            </div>

            {/* Rodapé */}
            <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
              <Badge variant="success">👁️ {selectedStatus.views} visualizações</Badge>
              <Button
                variant="secondary"
                style={{ flex: 1 }}
                onClick={() => handleLike(selectedStatus.id)}
              >
                {selectedStatus.liked ? '❤️ Curtido' : '🤍 Curtir'} {selectedStatus.likes > 0 ? selectedStatus.likes : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Componente de teste para anúncios - remover em produção */}
      {process.env.NODE_ENV === 'development' && <TestExoclickAd />}
    </div>
  )
}

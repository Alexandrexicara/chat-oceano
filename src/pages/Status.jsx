import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'
import { AudioRecorder, VideoRecorder } from '../components/AudioVideoRecorder'
import { playBottleSound } from '../utils/sounds'

export function Status() {
  const { user, logout } = useAuth()
  const [mode, setMode] = useState('view') // view ou create
  const [statusForm, setStatusForm] = useState({ text: '', mediaUrl: '', mediaType: '' })
  const [selectedStatus, setSelectedStatus] = useState(null) // Status selecionado para abrir
  const [statuses, setStatuses] = useState([
    {
      id: 1,
      author: 'João Silva',
      avatar: '👤',
      content: 'Que dia lindo! 🌞',
      type: 'text',
      timestamp: '2 minutos atrás',
      views: 15,
      likes: 3,
      liked: false,
    },
    {
      id: 2,
      author: 'Maria Santos',
      avatar: '👩',
      content: 'Viajando para a praia! 🏖️',
      type: 'text',
      timestamp: '1 hora atrás',
      views: 32,
      likes: 8,
      liked: false,
    },
  ])

  const handleCreateStatus = (e) => {
    e.preventDefault()
    if (!statusForm.text.trim() && !statusForm.mediaUrl) return

    // Determinar tipo: video = barril, texto/audio = garrafa
    const statusType = statusForm.mediaType === 'video' ? 'video' : 'text'

    const newStatus = {
      id: Date.now(),
      author: user?.name || 'Você',
      avatar: '👤',
      content: statusForm.text,
      type: statusType,
      mediaUrl: statusForm.mediaUrl,
      mediaType: statusForm.mediaType,
      timestamp: 'agora',
      views: 0,
      likes: 0,
      liked: false,
    }

    setStatuses([newStatus, ...statuses])
    setStatusForm({ text: '', mediaUrl: '', mediaType: '' })
    setMode('view')
    playBottleSound()
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

  const handleAudioRecording = (audioUrl) => {
    setStatusForm({
      ...statusForm,
      mediaUrl: audioUrl,
      mediaType: 'audio'
    })
  }

  const handleVideoRecording = (videoUrl) => {
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
        {mode === 'view' ? (
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
              {statuses.map((status, idx) => (
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
                        }}
                      >
                        {status.avatar}
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
                          {status.mediaUrl && (
                            <audio controls style={{ width: '100%', marginTop: '8px' }}>
                              <source src={status.mediaUrl} />
                            </audio>
                          )}
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
              ))}
            </div>

            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </>
        ) : (
          <Card style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: theme.spacing.lg }}>Criar Novo Status 🍾</h2>

            <form onSubmit={handleCreateStatus}>
              <Input
                label="Seu Status"
                as="textarea"
                value={statusForm.text}
                onChange={e => setStatusForm({ ...statusForm, text: e.target.value })}
                placeholder="Compartilhe um momento..."
                rows={4}
                style={{ fontFamily: theme.fonts.family.base }}
              />

              {/* Preview do mídia */}
              {statusForm.mediaUrl && (
                <div style={{ marginBottom: theme.spacing.md }}>
                  {statusForm.mediaType === 'video' ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.lg, background: theme.colors.background, borderRadius: theme.borderRadius.md }}>
                      <p style={{ fontSize: '40px', marginBottom: theme.spacing.sm }}>🛢️</p>
                      <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>Vídeo gravado (barril)</p>
                    </div>
                  ) : statusForm.mediaType === 'audio' ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.lg, background: theme.colors.background, borderRadius: theme.borderRadius.md }}>
                      <p style={{ fontSize: '40px', marginBottom: theme.spacing.sm }}>🍾</p>
                      <p style={{ fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>Áudio gravado (garrafa)</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Gravadores */}
              <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <AudioRecorder onRecordingComplete={handleAudioRecording} />
                <VideoRecorder onRecordingComplete={handleVideoRecording} />
              </div>

              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 1 }}
                >
                  📤 Publicar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode('view')
                    setStatusForm({ text: '', mediaUrl: '', mediaType: '' })
                  }}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
      </Container>

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
              <div style={{ fontSize: '32px' }}>{selectedStatus.avatar}</div>
              <div>
                <h3 style={{ margin: 0, color: theme.colors.text }}>{selectedStatus.author}</h3>
                <p style={{ margin: 0, fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                  {selectedStatus.timestamp}
                </p>
              </div>
            </div>

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
    </div>
  )
}

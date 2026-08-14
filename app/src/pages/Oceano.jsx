import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Header, Container, Card, Button, Input, Badge } from '../components/BaseComponents'
import { theme } from '../styles/theme'
import { AudioRecorder, VideoRecorder } from '../components/AudioVideoRecorder'
import { playBottleSound } from '../utils/sounds'
import { MiniAnuncio } from '../components/MiniAnuncio'
import { ExoclickAd } from '../components/ExoclickAd'
import { getOceanoMessages, sendMessage as sendApiMessage, uploadFile } from '../services/api'

export function Oceano() {
  const { user, logout } = useAuth()
  const [mode, setMode] = useState('view') // view | create
  const [form, setForm] = useState({ text: '', mediaUrl: '', mediaType: '' })
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAnuncio, setShowAnuncio] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  // Carregar mensagens do oceano do banco de dados
  useEffect(() => {
    const load = async () => {
      try {
        const msgs = await getOceanoMessages()
        const mapped = msgs.map(msg => ({
          id: msg.id,
          author: msg.sender_name || 'Usuário',
          avatar: msg.sender_avatar || '👤',
          content: msg.text,
          type: msg.media_type === 'video' ? 'video' : 'text',
          mediaUrl: msg.media_url,
          mediaType: msg.media_type,
          timestamp: new Date(msg.created_at).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          }),
          views: msg.views || 0,
          likes: msg.likes || 0,
          liked: false,
          sender_id: msg.sender_id,
        }))
        setItems(mapped)
      } catch (err) {
        console.error('Erro ao carregar Oceano:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Polling leve a cada 30s para novos itens (substitui socket sem backend separado)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const msgs = await getOceanoMessages()
        const mapped = msgs.map(msg => ({
          id: msg.id,
          author: msg.sender_name || 'Usuário',
          avatar: msg.sender_avatar || '👤',
          content: msg.text,
          type: msg.media_type === 'video' ? 'video' : 'text',
          mediaUrl: msg.media_url,
          mediaType: msg.media_type,
          timestamp: new Date(msg.created_at).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          }),
          views: msg.views || 0,
          likes: msg.likes || 0,
          liked: false,
          sender_id: msg.sender_id,
        }))
        setItems(prev => {
          // Adicionar apenas itens novos
          const existingIds = new Set(prev.map(i => i.id))
          const newOnes = mapped.filter(m => !existingIds.has(m.id))
          if (newOnes.length > 0) {
            playBottleSound()
            return [...newOnes, ...prev]
          }
          return prev
        })
      } catch { /* silencioso */ }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handlePublish = async (e) => {
    e.preventDefault()
    if (!form.text.trim() && !form.mediaUrl) return

    setPublishing(true)
    try {
      let mediaUrlFinal = form.mediaUrl

      if (form.mediaUrl && form.mediaUrl.startsWith('blob:')) {
        try {
          const res = await fetch(form.mediaUrl)
          const blob = await res.blob()
          const ext = form.mediaType === 'video' ? 'webm' : 'webm'
          const file = new File([blob], `oceano_${user?.id}_${Date.now()}.${ext}`, { type: blob.type })
          const uploadResult = await uploadFile(file)
          mediaUrlFinal = uploadResult.url || uploadResult.path || (uploadResult.filename ? `/uploads/${uploadResult.filename}` : mediaUrlFinal)
        } catch (err) {
          console.error('Erro upload mídia:', err)
        }
      }

      const saved = await sendApiMessage({
        sender_id: user?.id,
        text: form.text,
        media_url: mediaUrlFinal,
        media_type: form.mediaType,
        is_oceano: true,
      })

      const newItem = {
        id: saved.id,
        author: user?.name || 'Você',
        avatar: user?.avatar || '👤',
        content: form.text,
        type: form.mediaType === 'video' ? 'video' : 'text',
        mediaUrl: mediaUrlFinal,
        mediaType: form.mediaType,
        timestamp: 'agora',
        views: 0,
        likes: 0,
        liked: false,
        sender_id: user?.id,
      }

      setItems(prev => [newItem, ...prev])
      setForm({ text: '', mediaUrl: '', mediaType: '' })
      setMode('view')
      playBottleSound()
      alert('✅ Lançado no Oceano!')
    } catch (err) {
      console.error('Erro ao publicar:', err)
      alert('Erro ao publicar: ' + (err.response?.data?.error || err.message))
    } finally {
      setPublishing(false)
    }
  }

  const handleLike = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      return { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
    }))
    if (selectedItem?.id === id) {
      setSelectedItem(prev => ({
        ...prev,
        liked: !prev.liked,
        likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
      }))
    }
  }

  // Ícone garrafa flutuando
  const BottleIcon = ({ isOwn }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', transform: 'rotate(90deg)' }}>
        <div style={{
          width: '50px', height: '80px',
          background: isOwn ? '#4ade80' : '#1a4d6d',
          border: `2px solid ${theme.colors.secondary}`,
          borderRadius: '8px 8px 20px 20px',
          position: 'relative',
        }} />
        <div style={{
          width: '20px', height: '30px',
          background: isOwn ? '#4ade80' : '#1a4d6d',
          border: `2px solid ${theme.colors.secondary}`,
          borderRadius: '4px 4px 0 0',
          position: 'absolute',
          top: '-30px', left: '15px',
        }} />
      </div>
    </div>
  )

  // Ícone barril
  const BarrelIcon = ({ isOwn }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <img
        src="/img/barril.png"
        alt="Barril"
        style={{
          width: '180px', height: '90px', objectFit: 'contain',
          filter: isOwn
            ? 'drop-shadow(0 0 12px rgba(74,222,128,0.5)) brightness(1.1)'
            : 'drop-shadow(0 0 12px rgba(139,105,20,0.5))',
        }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
    </div>
  )

  const AvatarCell = ({ item }) => (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: theme.colors.background,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '20px', overflow: 'hidden', flexShrink: 0,
    }}>
      {item.avatar && (item.avatar.startsWith('http') || item.avatar.startsWith('/'))
        ? <img src={item.avatar} alt={item.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span>{item.avatar || '👤'}</span>
      }
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: theme.colors.background, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header com fundo oceano */}
      <Header style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d2a4d 50%, #0a3d6b 100%)', borderBottom: `2px solid ${theme.colors.secondary}` }}>
        <div>
          <h1 style={{ fontSize: theme.fonts.sizes.xl, margin: 0 }}>🌊 Oceano</h1>
          <p style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, margin: 0 }}>
            Espaço público — jogue sua garrafa ou barril aqui
          </p>
        </div>
        <Button variant="secondary" onClick={logout}>Sair</Button>
      </Header>

      <Container style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 70px - 60px)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
            <p style={{ fontSize: '48px', marginBottom: theme.spacing.md }}>🌊</p>
            <p style={{ color: theme.colors.textSecondary }}>Carregando o Oceano...</p>
          </div>
        ) : mode === 'view' ? (
          <>
            {/* Banner explicativo */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,163,255,0.15), rgba(74,222,128,0.1))',
              border: `1px solid ${theme.colors.secondary}`,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>🍾🛢️🌊</p>
              <p style={{ fontWeight: 'bold', fontSize: theme.fonts.sizes.md, marginBottom: '4px' }}>
                O Oceano é público!
              </p>
              <p style={{ color: theme.colors.textSecondary, fontSize: theme.fonts.sizes.sm }}>
                Jogue sua garrafa (texto/áudio) ou barril (vídeo) para qualquer um ver. Sem filtros, sem privacidade — tudo flutua aqui!
              </p>
            </div>

            <div style={{ marginBottom: theme.spacing.xl }}>
              <Button variant="primary" onClick={() => setMode('create')} style={{ width: '100%', fontSize: theme.fonts.sizes.lg, padding: `${theme.spacing.md} ${theme.spacing.lg}` }}>
                🍾 Jogar no Oceano
              </Button>
            </div>

            {/* Grid de garrafas/barris */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: theme.spacing.lg }}>
              {items.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1', textAlign: 'center',
                  padding: theme.spacing.xl, background: theme.colors.surface,
                  borderRadius: theme.borderRadius.md,
                }}>
                  <p style={{ fontSize: '64px', marginBottom: theme.spacing.md }}>🌊</p>
                  <p style={{ fontSize: theme.fonts.sizes.lg, marginBottom: theme.spacing.sm }}>
                    <strong>O oceano está vazio...</strong>
                  </p>
                  <p style={{ color: theme.colors.textSecondary }}>
                    Seja o primeiro a jogar algo aqui!
                  </p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.id} style={{ animation: `float ${3 + idx * 0.4}s ease-in-out infinite` }}>
                    <Card style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = theme.shadows.lg }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadows.sm }}
                    >
                      {/* Info do autor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                        <AvatarCell item={item} />
                        <div>
                          <p style={{ fontWeight: 'bold', margin: 0 }}>{item.author}</p>
                          <p style={{ fontSize: theme.fonts.sizes.xs, color: theme.colors.textSecondary, margin: 0 }}>{item.timestamp}</p>
                        </div>
                        <Badge variant="primary" style={{ marginLeft: 'auto', fontSize: '10px' }}>
                          {item.type === 'video' ? '🛢️ Barril' : item.mediaType === 'audio' ? '🍾 Áudio' : '🍾 Texto'}
                        </Badge>
                      </div>

                      {/* Ícone e prévia */}
                      <div style={{
                        background: theme.colors.background, padding: theme.spacing.md,
                        borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.md,
                        minHeight: '130px', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                        onClick={() => { setSelectedItem(item); playBottleSound() }}
                      >
                        {item.type === 'video' ? (
                          <>
                            <BarrelIcon isOwn={item.sender_id === user?.id} />
                            <p style={{ fontSize: theme.fonts.sizes.sm, textAlign: 'center', marginTop: '8px' }}>
                              🛢️ {item.content || 'Vídeo no barril'}
                            </p>
                          </>
                        ) : item.mediaType === 'audio' ? (
                          <>
                            <BottleIcon isOwn={item.sender_id === user?.id} />
                            <p style={{ fontSize: theme.fonts.sizes.sm, textAlign: 'center', marginTop: '8px' }}>
                              🍾 🎤 Áudio na garrafa
                            </p>
                          </>
                        ) : (
                          <>
                            <BottleIcon isOwn={item.sender_id === user?.id} />
                            <p style={{ fontSize: theme.fonts.sizes.md, textAlign: 'center', marginTop: '8px', wordBreak: 'break-word' }}>
                              🍾 {item.content}
                            </p>
                          </>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                        <Badge variant="success">👁️ {item.views}</Badge>
                        <Button variant="secondary" style={{ flex: 1 }} onClick={() => handleLike(item.id)}>
                          {item.liked ? '❤️ Curtido' : '🤍 Curtir'} {item.likes > 0 ? item.likes : ''}
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
                50% { transform: translateY(-18px); }
              }
            `}</style>
          </>
        ) : (
          /* Formulário de criação */
          <Card style={{ maxWidth: '500px', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto', paddingBottom: theme.spacing.xl }}>
            <h2 style={{ marginBottom: theme.spacing.lg }}>🌊 Jogar no Oceano</h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg, fontSize: theme.fonts.sizes.sm }}>
              Essa mensagem será pública — qualquer pessoa pode ver no Oceano!
            </p>

            <form onSubmit={handlePublish}>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>
                  Sua mensagem
                </label>
                <textarea
                  value={form.text}
                  onChange={e => setForm({ ...form, text: e.target.value })}
                  placeholder="O que você quer jogar no oceano?"
                  rows={4}
                  style={{
                    width: '100%', padding: theme.spacing.md,
                    background: theme.colors.surface, color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius.md,
                    fontSize: theme.fonts.sizes.md, fontFamily: 'inherit', resize: 'vertical',
                  }}
                />
              </div>

              {/* Preview de mídia */}
              {form.mediaUrl && (
                <div style={{ marginBottom: theme.spacing.md }}>
                  {form.mediaType === 'video' ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, background: theme.colors.background, borderRadius: theme.borderRadius.md, minHeight: '150px' }}>
                      <p style={{ fontSize: '60px', marginBottom: theme.spacing.md }}>🛢️</p>
                      <p style={{ color: theme.colors.textSecondary }}>Vídeo no barril — pronto!</p>
                      <Button type="button" variant="danger" onClick={() => setForm({ ...form, mediaUrl: '', mediaType: '' })} style={{ marginTop: '8px', fontSize: '12px', padding: '4px 12px' }}>
                        ✕ Remover
                      </Button>
                    </div>
                  ) : form.mediaType === 'audio' ? (
                    <div style={{ textAlign: 'center', padding: theme.spacing.xl, background: theme.colors.background, borderRadius: theme.borderRadius.md, minHeight: '150px' }}>
                      <p style={{ fontSize: '60px', marginBottom: theme.spacing.md }}>🍾</p>
                      <p style={{ color: theme.colors.textSecondary }}>Áudio na garrafa — pronto!</p>
                      <Button type="button" variant="danger" onClick={() => setForm({ ...form, mediaUrl: '', mediaType: '' })} style={{ marginTop: '8px', fontSize: '12px', padding: '4px 12px' }}>
                        ✕ Remover
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Gravadores */}
              <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.lg, flexWrap: 'wrap' }}>
                <AudioRecorder onRecordingComplete={({ url }) => setForm({ ...form, mediaUrl: url, mediaType: 'audio' })} />
                <VideoRecorder onRecordingComplete={({ url }) => setForm({ ...form, mediaUrl: url, mediaType: 'video' })} />
              </div>

              {/* Ver anúncio */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <Button type="button" variant="secondary" onClick={() => setShowAnuncio(true)} style={{ width: '100%' }}>
                  📺 Ver Anúncio (ganhe CDCOINs)
                </Button>
              </div>

              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button type="submit" variant="primary" disabled={publishing} style={{
                  flex: 1, padding: `${theme.spacing.md} ${theme.spacing.lg}`, fontSize: theme.fonts.sizes.lg,
                  background: publishing ? '#999' : theme.colors.secondary,
                  cursor: publishing ? 'not-allowed' : 'pointer',
                }}>
                  {publishing ? '⏳ Lançando...' : '🌊 Lançar no Oceano'}
                </Button>
                <Button type="button" variant="secondary" disabled={publishing} onClick={() => { setMode('view'); setForm({ text: '', mediaUrl: '', mediaType: '' }) }} style={{ flex: 1 }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}
      </Container>

      {/* Modal anúncio */}
      {showAnuncio && <MiniAnuncio onClose={() => setShowAnuncio(false)} />}

      {/* Modal detalhes garrafa/barril */}
      {selectedItem && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{ background: theme.colors.background, borderRadius: theme.borderRadius.lg, maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: theme.spacing.lg, position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', color: theme.colors.text }}>
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AvatarCell item={selectedItem} />
              <div>
                <h3 style={{ margin: 0, color: theme.colors.text }}>{selectedItem.author}</h3>
                <p style={{ margin: 0, fontSize: theme.fonts.sizes.sm, color: theme.colors.textSecondary }}>{selectedItem.timestamp}</p>
              </div>
            </div>

            <ExoclickAd />

            <div style={{ marginBottom: '16px' }}>
              {selectedItem.type === 'video' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BarrelIcon isOwn={selectedItem.sender_id === user?.id} />
                  </div>
                  {selectedItem.mediaUrl ? (
                    <video controls style={{ width: '100%', borderRadius: theme.borderRadius.md }}>
                      <source src={selectedItem.mediaUrl} />
                    </video>
                  ) : (
                    <p style={{ textAlign: 'center', color: theme.colors.textSecondary }}>🛢️ {selectedItem.content || 'Vídeo no barril'}</p>
                  )}
                </>
              ) : selectedItem.mediaType === 'audio' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BottleIcon isOwn={selectedItem.sender_id === user?.id} />
                  </div>
                  {selectedItem.mediaUrl && (
                    <audio controls style={{ width: '100%' }}>
                      <source src={selectedItem.mediaUrl} />
                    </audio>
                  )}
                  {selectedItem.content && <p style={{ textAlign: 'center', marginTop: '12px', color: theme.colors.text }}>🍾 {selectedItem.content}</p>}
                </>
              ) : selectedItem.mediaType === 'image' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BottleIcon isOwn={selectedItem.sender_id === user?.id} />
                  </div>
                  <img src={selectedItem.mediaUrl} alt={selectedItem.content} style={{ width: '100%', borderRadius: theme.borderRadius.md }} />
                  {selectedItem.content && <p style={{ marginTop: '12px', color: theme.colors.text }}>🍾 {selectedItem.content}</p>}
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <BottleIcon isOwn={selectedItem.sender_id === user?.id} />
                  </div>
                  <p style={{ textAlign: 'center', fontSize: theme.fonts.sizes.lg, color: theme.colors.text }}>
                    🍾 {selectedItem.content}
                  </p>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
              <Badge variant="success">👁️ {selectedItem.views} visualizações</Badge>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => handleLike(selectedItem.id)}>
                {selectedItem.liked ? '❤️ Curtido' : '🤍 Curtir'} {selectedItem.likes > 0 ? selectedItem.likes : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

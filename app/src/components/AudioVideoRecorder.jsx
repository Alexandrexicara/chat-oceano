import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/BaseComponents'
import { theme } from '../styles/theme'

// Componente para gravar áudio
export function AudioRecorder({ onRecordingComplete }) {
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
        <button
          type="button"
          onClick={startRecording}
          title="Gravar áudio"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '50px',
            padding: '4px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🎤
        </button>
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
export function VideoRecorder({ onRecordingComplete }) {
  const [phase, setPhase] = useState('idle') // idle | preview | recording
  const [facingMode, setFacingMode] = useState('user')
  const [recordingTime, setRecordingTime] = useState(0)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Sempre que o preview abre ou câmera muda, conectar stream ao <video>
  useEffect(() => {
    if (phase === 'idle') return
    let cancelled = false

    const openStream = async () => {
      // Parar stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      } catch (err) {
        console.error('Câmera indisponível:', err)
        alert('Não foi possível acessar a câmera. Verifique as permissões.')
        setPhase('idle')
      }
    }

    openStream()
    return () => { cancelled = true }
  }, [phase, facingMode]) // eslint-disable-line

  const startPreview = () => setPhase('preview')

  const startRecording = () => {
    if (!streamRef.current) return
    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm'

    const rec = new MediaRecorder(streamRef.current, { mimeType })
    mediaRecorderRef.current = rec
    chunksRef.current = []

    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      onRecordingComplete({ url: URL.createObjectURL(blob), blob, type: 'video' })
      cleanup()
    }

    rec.start()
    setPhase('recording')
    setRecordingTime(0)
    timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
    // onstop fará o cleanup
  }

  const cleanup = () => {
    clearInterval(timerRef.current)
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    setPhase('idle')
    setRecordingTime(0)
  }

  const cancel = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
    cleanup()
  }

  const flipCamera = () => {
    const next = facingMode === 'user' ? 'environment' : 'user'
    // Se gravando, parar gravação antes de trocar
    if (phase === 'recording') {
      clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
      chunksRef.current = []
      mediaRecorderRef.current = null
    }
    setFacingMode(next)
    setPhase('preview') // vai re-triggar o useEffect com nova câmera
    setRecordingTime(0)
  }

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  if (phase === 'idle') {
    return (
      <button type="button" onClick={startPreview} title="Gravar vídeo"
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '50px', padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        🎥
      </button>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
      {/* Preview ao vivo */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />

        {/* REC badge */}
        {phase === 'recording' && (
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,.6)', borderRadius: 20, padding: '6px 14px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f00', animation: 'recpulse 1s infinite' }} />
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>REC {fmt(recordingTime)}</span>
          </div>
        )}

        {/* Botão câmera — topo direito */}
        <button type="button" onClick={flipCamera}
          style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: '50%', width: 52, height: 52, cursor: 'pointer', fontSize: 26, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={facingMode === 'user' ? 'Câmera traseira' : 'Câmera frontal'}
        >🔄</button>

        {/* Label câmera */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.5)', borderRadius: 12, padding: '3px 14px', color: '#fff', fontSize: 13, whiteSpace: 'nowrap' }}>
          {facingMode === 'user' ? '🤳 Frontal' : '📷 Traseira'}
        </div>
      </div>

      {/* Controles */}
      <div style={{ background: 'rgba(0,0,0,.85)', padding: '18px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        {/* Cancelar */}
        <button type="button" onClick={cancel}
          style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', fontSize: 22, color: '#fff' }}>
          ✕
        </button>

        {/* Gravar / Parar */}
        {phase === 'preview' ? (
          <button type="button" onClick={startRecording}
            style={{ width: 72, height: 72, borderRadius: '50%', background: '#f00', border: '4px solid #fff', cursor: 'pointer', fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
            title="Iniciar gravação">⏺</button>
        ) : (
          <button type="button" onClick={stopRecording}
            style={{ width: 72, height: 72, borderRadius: '50%', background: '#f00', border: '4px solid #fff', cursor: 'pointer', fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
            title="Parar e enviar">⏹</button>
        )}

        {/* Virar câmera */}
        <button type="button" onClick={flipCamera}
          style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', cursor: 'pointer', fontSize: 26, color: '#fff' }}
          title={facingMode === 'user' ? 'Câmera traseira' : 'Câmera frontal'}>
          🔄
        </button>
      </div>

      <style>{`@keyframes recpulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  )
}

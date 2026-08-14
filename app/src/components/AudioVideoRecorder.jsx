import { useState, useRef } from 'react'
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
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [facingMode, setFacingMode] = useState('user') // 'user' = frontal | 'environment' = traseira
  const videoPreviewRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const startStream = async (facing) => {
    // Parar stream anterior se existir
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    })
    streamRef.current = stream
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream
    }
    return stream
  }

  const startRecording = async () => {
    try {
      const stream = await startStream(facingMode)
      setShowPreview(true)

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        onRecordingComplete({ url, blob, type: 'video' })
        setShowPreview(false)
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
      alert('Não foi possível acessar a câmera. Verifique as permissões.')
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
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setIsRecording(false)
    setShowPreview(false)
    clearInterval(timerRef.current)
  }

  const flipCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)

    // Se já está gravando, reiniciar o stream com a nova câmera
    if (isRecording && mediaRecorderRef.current) {
      // Pausar gravação, trocar stream, retomar
      try {
        const newStream = await startStream(newFacing)
        // Substituir as tracks no mediaRecorder não é direto — mais simples: avisar o usuário
        // e reiniciar a gravação com a nova câmera
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        clearInterval(timerRef.current)
        chunksRef.current = []

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus' : 'video/webm'
        const newRecorder = new MediaRecorder(newStream, { mimeType })
        mediaRecorderRef.current = newRecorder

        newRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        newRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' })
          const url = URL.createObjectURL(blob)
          onRecordingComplete({ url, blob, type: 'video' })
          setShowPreview(false)
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        }
        newRecorder.start()
        setIsRecording(true)
        setRecordingTime(0)
        timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
      } catch (err) {
        console.error('Erro ao trocar câmera:', err)
      }
    } else if (showPreview) {
      // Ainda não gravando mas preview aberto — só trocar a câmera do preview
      try {
        await startStream(newFacing)
      } catch (err) {
        console.error('Erro ao trocar câmera no preview:', err)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (showPreview) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: '#000', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      }}>
        {/* Preview ao vivo */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              maxHeight: '70vh',
              borderRadius: '12px',
              objectFit: 'cover',
              // Espelhar apenas câmera frontal
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />

          {/* Indicador REC */}
          {isRecording && (
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,0,0,0.6)', borderRadius: '20px', padding: '6px 14px',
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#ff4444', animation: 'pulse 1s infinite',
              }} />
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                REC {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Botão virar câmera — canto superior direito */}
          <button
            type="button"
            onClick={flipCamera}
            title={facingMode === 'user' ? 'Câmera traseira' : 'Câmera frontal'}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
              width: '52px', height: '52px', cursor: 'pointer',
              fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}
          >
            🔄
          </button>

          {/* Label câmera ativa */}
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.55)', borderRadius: '12px', padding: '4px 14px',
            color: '#fff', fontSize: '13px',
          }}>
            {facingMode === 'user' ? '🤳 Câmera frontal' : '📷 Câmera traseira'}
          </div>
        </div>

        {/* Controles */}
        <div style={{
          width: '100%', maxWidth: '480px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '24px', padding: '20px 16px',
          background: 'rgba(0,0,0,0.8)',
        }}>
          {/* Cancelar */}
          <button
            type="button"
            onClick={cancelRecording}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: '56px', height: '56px', fontSize: '22px', cursor: 'pointer', color: '#fff',
            }}
          >
            ✕
          </button>

          {/* Gravar / Parar — botão central grande */}
          {!isRecording ? (
            <button
              type="button"
              onClick={() => {
                const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                  ? 'video/webm;codecs=vp9,opus' : 'video/webm'
                const stream = streamRef.current
                if (!stream) return
                const rec = new MediaRecorder(stream, { mimeType })
                mediaRecorderRef.current = rec
                chunksRef.current = []
                rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
                rec.onstop = () => {
                  const blob = new Blob(chunksRef.current, { type: 'video/webm' })
                  onRecordingComplete({ url: URL.createObjectURL(blob), blob, type: 'video' })
                  setShowPreview(false)
                  if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
                }
                rec.start()
                setIsRecording(true)
                setRecordingTime(0)
                timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
              }}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#ff4444', border: '4px solid #fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px',
              }}
              title="Iniciar gravação"
            >
              ⏺
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#ff4444', border: '4px solid #fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px',
              }}
              title="Parar gravação"
            >
              ⏹
            </button>
          )}

          {/* Virar câmera — também no rodapé */}
          <button
            type="button"
            onClick={flipCamera}
            title={facingMode === 'user' ? 'Câmera traseira' : 'Câmera frontal'}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: '56px', height: '56px', fontSize: '26px', cursor: 'pointer', color: '#fff',
            }}
          >
            🔄
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    )
  }

  // Botão inicial — abre preview antes de gravar
  return (
    <button
      type="button"
      onClick={startRecording}
      title="Gravar vídeo"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '50px', padding: '4px', lineHeight: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      🎥
    </button>
  )
}

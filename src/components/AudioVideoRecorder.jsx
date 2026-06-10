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
export function VideoRecorder({ onRecordingComplete }) {
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

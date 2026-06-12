import { useState, useEffect } from 'react'
import { theme } from '../styles/theme'

// Componente de Mini-Anúncio (30 segundos)
export function MiniAnuncio({ onClose }) {
  const [tempoRestante, setTempoRestante] = useState(30)
  const [anuncioAtual] = useState(() => {
    // Lista de anúncios aleatórios
    const anuncios = [
      {
        titulo: '🚀 Curso de Programação',
        descricao: 'Aprenda Python do zero ao avançado!',
        cor: '#4ade80',
        emoji: '💻',
      },
      {
        titulo: '🎮 Jogo Pirata',
        descricao: 'Baixe o novo jogo de piratas!',
        cor: '#A0782C',
        emoji: '🏴‍☠️',
      },
      {
        titulo: '📱 App Grátis',
        descricao: 'Organize suas tarefas facilmente!',
        cor: '#0066cc',
        emoji: '✅',
      },
      {
        titulo: '🎵 Música Oceanos',
        descricao: 'Playlist relaxante do mar!',
        cor: '#25D366',
        emoji: '🌊',
      },
      {
        titulo: '💰 Ganhe CDCOINs',
        descricao: 'Indique amigos e ganhe moedas!',
        cor: '#FFD700',
        emoji: '🪙',
      },
    ]
    return anuncios[Math.floor(Math.random() * anuncios.length)]
  })

  useEffect(() => {
    // Timer de 30 segundos
    const timer = setInterval(() => {
      setTempoRestante(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fechar quando chegar a 0
  useEffect(() => {
    if (tempoRestante <= 0) {
      onClose()
    }
  }, [tempoRestante, onClose])

  // Calcular progresso da barra
  const progresso = (tempoRestante / 30) * 100

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '300px',
      background: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: `2px solid ${anuncioAtual.cor}`,
      boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${anuncioAtual.cor}40`,
      zIndex: 2500,
      overflow: 'hidden',
      animation: 'slideInRight 0.5s ease',
    }}>
      {/* Header com timer */}
      <div style={{
        background: anuncioAtual.cor,
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ 
          color: '#fff', 
          fontWeight: 'bold',
          fontSize: theme.fonts.sizes.sm,
        }}>
          📺 Anúncio
        </span>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          color: '#fff',
          fontSize: theme.fonts.sizes.sm,
          fontWeight: 'bold',
        }}>
          {tempoRestante}s
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{
        height: '4px',
        background: theme.colors.border,
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${progresso}%`,
          background: anuncioAtual.cor,
          transition: 'width 1s linear',
        }} />
      </div>

      {/* Conteúdo do anúncio */}
      <div style={{ padding: theme.spacing.md }}>
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing.sm,
        }}>
          <span style={{ 
            fontSize: '48px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}>
            {anuncioAtual.emoji}
          </span>
        </div>

        <h3 style={{
          color: anuncioAtual.cor,
          marginBottom: theme.spacing.xs,
          fontSize: theme.fonts.sizes.md,
          textAlign: 'center',
        }}>
          {anuncioAtual.titulo}
        </h3>

        <p style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fonts.sizes.sm,
          textAlign: 'center',
          marginBottom: theme.spacing.sm,
        }}>
          {anuncioAtual.descricao}
        </p>

        <button
          onClick={() => {
            alert('Redirecionando para o anúncio...')
            onClose()
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: anuncioAtual.cor,
            color: '#fff',
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: theme.fonts.sizes.sm,
          }}
        >
          Saiba Mais →
        </button>

        {/* Botão pular (aparece após 5 segundos) */}
        {tempoRestante <= 25 && (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '4px',
              background: 'none',
              color: theme.colors.textSecondary,
              border: 'none',
              cursor: 'pointer',
              fontSize: theme.fonts.sizes.xs,
              marginTop: '4px',
              textDecoration: 'underline',
            }}
          >
            Pular anúncio
          </button>
        )}
      </div>
      {/* Animação via CSS inline */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

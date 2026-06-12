import { useState } from 'react'
import { Button } from './BaseComponents'
import { theme } from '../styles/theme'

// Componente de Tutorial/Guia do Oceanos
export function OceanosTutorial({ onClose }) {
  const [passoAtual, setPassoAtual] = useState(0)

  const passos = [
    {
      titulo: '🌊 Bem-vindo ao Oceanos!',
      descricao: 'O mensageiro pirata onde você navega, conversa e ganha moedas!',
      imagem: '🏴‍☠️',
      cor: theme.colors.primary,
    },
    {
      titulo: '🍾 Garrafas no Mar',
      descricao: 'Envie mensagens de texto e áudio em garrafas flutuantes. Seus amigos recebem com um som especial!',
      imagem: '📜',
      cor: '#4ade80',
    },
    {
      titulo: '🛢️ Barris Piratas',
      descricao: 'Vídeos são enviados em barris! Quando alguém abre, toca um som de pirata!',
      imagem: '🎬',
      cor: '#A0782C',
    },
    {
      titulo: '🌊 Oceano Coletivo',
      descricao: 'Jogue garrafas e barris no oceano público! Todos podem ver e interagir!',
      imagem: '🌍',
      cor: '#0066cc',
    },
    {
      titulo: '📱 Contatos WhatsApp',
      descricao: 'Sincronize seus contatos e veja quem já usa o Oceanos. Envie convites!',
      imagem: '👥',
      cor: '#25D366',
    },
    {
      titulo: '🪙 Ganhe CDCOINs!',
      descricao: 'Cada acesso, mensagem aberta e interação te dá pontos! Troque por moeda real!',
      imagem: '💰',
      cor: '#FFD700',
    },
    {
      titulo: '🎬 Anúncios Rápidos',
      descricao: 'Quando abrir mensagens, vídeos ou status, um mini-anúncio aparece por 30 segundos. Isso mantém o sistema gratuito!',
      imagem: '📺',
      cor: '#ff9800',
    },
    {
      titulo: '🏴‍☠️ Pronto para Navegar?',
      descricao: 'Cadastre-se agora e comece a ganhar CDCOINs navegando pelo Oceanos!',
      imagem: '⚓',
      cor: theme.colors.primary,
    },
  ]

  const proximoPasso = () => {
    if (passoAtual < passos.length - 1) {
      setPassoAtual(passoAtual + 1)
    } else {
      onClose()
    }
  }

  const passoAnterior = () => {
    if (passoAtual > 0) {
      setPassoAtual(passoAtual - 1)
    }
  }

  const passo = passos[passoAtual]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        border: `3px solid ${passo.cor}`,
        boxShadow: `0 0 30px ${passo.cor}40`,
        position: 'relative',
      }}>
        {/* Botão fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            color: theme.colors.textSecondary,
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        {/* Ícone grande */}
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
        }}>
          <span style={{ 
            fontSize: '120px',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          }}>
            {passo.imagem}
          </span>
        </div>

        {/* Título */}
        <h2 style={{
          textAlign: 'center',
          color: passo.cor,
          marginBottom: theme.spacing.md,
          fontSize: theme.fonts.sizes.xl,
        }}>
          {passo.titulo}
        </h2>

        {/* Descrição */}
        <p style={{
          textAlign: 'center',
          color: theme.colors.text,
          marginBottom: theme.spacing.xl,
          fontSize: theme.fonts.sizes.md,
          lineHeight: 1.6,
        }}>
          {passo.descricao}
        </p>

        {/* Indicador de progresso */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: theme.spacing.lg,
        }}>
          {passos.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === passoAtual ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: idx === passoAtual ? passo.cor : theme.colors.border,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          {passoAtual > 0 && (
            <Button
              onClick={passoAnterior}
              variant="secondary"
              style={{ flex: 1 }}
            >
              ← Anterior
            </Button>
          )}
          <Button
            onClick={proximoPasso}
            variant="primary"
            style={{ 
              flex: 1,
              background: passo.cor,
            }}
          >
            {passoAtual === passos.length - 1 ? '🏴‍☠️ Começar!' : 'Próximo →'}
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { theme } from '../styles/theme'

// Componente de Anúncio Exoclick
// Exibe o anúncio REAL quando a garrafa/barril é aberto
export function ExoclickAd() {
  const containerRef = useRef(null)
  const adLoadedRef = useRef(false)
  const [showCloseButton, setShowCloseButton] = useState(false)

  useEffect(() => {
    // Função para carregar o anúncio
    const loadAd = () => {
      if (adLoadedRef.current) return
      
      if (window.AdProvider) {
        try {
          // Limpar o container primeiro
          if (containerRef.current) {
            const insElement = containerRef.current.querySelector('ins')
            if (insElement) {
              // Forçar recarregamento do anúncio
              insElement.innerHTML = ''
            }
          }
          
          // Servir o anúncio
          window.AdProvider.push({ "serve": {} })
          adLoadedRef.current = true
          console.log('✅ Anúncio Exoclick carregado com sucesso!')
          
          // Mostrar botão de fechar após 5 segundos
          setTimeout(() => {
            setShowCloseButton(true)
          }, 5000)
        } catch (error) {
          console.error('❌ Erro ao carregar anúncio:', error)
        }
      } else {
        console.log('⏳ Aguardando AdProvider...')
        // Tentar novamente após 1 segundo
        setTimeout(loadAd, 1000)
      }
    }
    
    // Iniciar carregamento
    loadAd()
    
    // Cleanup quando desmontar
    return () => {
      adLoadedRef.current = false
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '16px 0',
        background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05), rgba(139, 105, 20, 0.05))',
        borderRadius: '12px',
        padding: '16px',
        position: 'relative',
        border: `1px solid ${showCloseButton ? 'rgba(74, 222, 128, 0.3)' : 'rgba(0,0,0,0.1)'}`,
      }}
    >
      {/* Indicador de carregamento */}
      {!showCloseButton && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 1,
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 8px',
          }} />
          <p style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
            Carregando anúncio...
          </p>
        </div>
      )}
      
      {/* Elemento de anúncio do Exoclick */}
      <ins 
        className="eas6a97888e37" 
        data-zoneid="5948380"
        style={{
          width: '100%',
          display: 'block',
          position: 'relative',
          zIndex: 2,
        }}
      />
      
      {/* Link alternativo para o anúncio */}
      <a 
        href="https://omg10.com/4/9241934" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          zIndex: 4,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.preventDefault()
          window.open('https://omg10.com/4/9241934', '_blank')
        }}
      />
      
      {/* Botão para fechar o anúncio (aparece após 5 segundos) */}
      {showCloseButton && (
        <button
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.style.display = 'none'
            }
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#666',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 3,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ff4444'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
            e.currentTarget.style.color = '#666'
          }}
          title="Fechar anúncio"
        >
          ✕
        </button>
      )}
      
      {/* Animação do spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

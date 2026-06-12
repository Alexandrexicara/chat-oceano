import { useEffect, useRef } from 'react'

// Componente de Anúncio Exoclick
// Exibe o anúncio quando a garrafa/barril é aberto
export function ExoclickAd() {
  const containerRef = useRef(null)

  useEffect(() => {
    // Verificar se o script já está carregado
    if (!window.AdProvider) {
      console.log('Aguardando carregamento do AdProvider...')
    } else {
      // Servir o anúncio
      try {
        window.AdProvider.push({ "serve": {} })
        console.log('Anúncio Exoclick carregado com sucesso!')
      } catch (error) {
        console.error('Erro ao carregar anúncio:', error)
      }
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
        background: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      {/* Elemento de anúncio do Exoclick */}
      <ins 
        className="eas6a97888e37" 
        data-zoneid="5948380"
        style={{
          width: '100%',
          display: 'block',
        }}
      />
      
      {/* Botão para pular o anúncio */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
      }}>
        <button
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.style.display = 'none'
            }
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#333',
          }}
        >
          ✕ Fechar anúncio
        </button>
      </div>
    </div>
  )
}

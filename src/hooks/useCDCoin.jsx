import { useState, useEffect } from 'react'

// Hook para gerenciar CDCOINs do usuário
export function useCDCoin() {
  const [saldo, setSaldo] = useState(() => {
    // Carregar saldo do localStorage
    const saved = localStorage.getItem('oceanos_cdcoin')
    return saved ? parseInt(saved) : 0
  })

  const [historico, setHistorico] = useState(() => {
    const saved = localStorage.getItem('oceanos_cdcoin_history')
    return saved ? JSON.parse(saved) : []
  })

  // Salvar saldo no localStorage
  useEffect(() => {
    localStorage.setItem('oceanos_cdcoin', saldo.toString())
  }, [saldo])

  useEffect(() => {
    localStorage.setItem('oceanos_cdcoin_history', JSON.stringify(historico))
  }, [historico])

  // Adicionar pontos
  const adicionarPontos = (quantidade, descricao) => {
    setSaldo(prev => prev + quantidade)
    setHistorico(prev => [{
      id: Date.now(),
      quantidade,
      descricao,
      data: new Date().toISOString(),
      tipo: 'ganho',
    }, ...prev.slice(0, 49)]) // Manter apenas últimos 50
  }

  // Pontuação por ações
  const pontuar = {
    acessoDiario: () => {
      const hoje = new Date().toDateString()
      const ultimoAcesso = localStorage.getItem('oceanos_ultimo_acesso')
      
      if (ultimoAcesso !== hoje) {
        adicionarPontos(10, '🌅 Acesso diário')
        localStorage.setItem('oceanos_ultimo_acesso', hoje)
      }
    },

    mensagemEnviada: () => {
      adicionarPontos(2, '🍾 Mensagem enviada')
    },

    mensagemAberta: () => {
      adicionarPontos(1, '📜 Mensagem aberta')
    },

    videoEnviado: () => {
      adicionarPontos(5, '🛢️ Vídeo enviado')
    },

    videoAssistido: () => {
      adicionarPontos(3, '🎬 Vídeo assistido')
    },

    statusPostado: () => {
      adicionarPontos(5, '📸 Status postado')
    },

    statusVisualizado: () => {
      adicionarPontos(1, '👁️ Status visualizado')
    },

    contatoAdicionado: () => {
      adicionarPontos(10, '👥 Contato adicionado')
    },

    conviteEnviado: () => {
      adicionarPontos(20, '📩 Convite enviado')
    },

    anuncioAssistido: () => {
      adicionarPontos(5, '📺 Anúncio assistido')
    },

    oceanoParticipou: () => {
      adicionarPontos(3, '🌊 Participou do Oceano')
    },
  }

  // Converter CDCOIN para moeda real (exemplo: 100 CDCOIN = 1 USD)
  const converterParaMoeda = (cdcoinAmount, moedaDestino = 'BRL') => {
    const taxas = {
      BRL: 0.05, // 100 CDCOIN = 5 BRL
      USD: 0.01, // 100 CDCOIN = 1 USD
      EUR: 0.009, // 100 CDCOIN = 0.9 EUR
    }
    
    const taxa = taxas[moedaDestino] || taxas.BRL
    const valorConvertido = (cdcoinAmount / 100) * taxa
    
    return {
      valor: valorConvertido.toFixed(2),
      moeda: moedaDestino,
      simbolo: moedaDestino === 'BRL' ? 'R$' : moedaDestino === 'USD' ? '$' : '€',
    }
  }

  return {
    saldo,
    historico,
    adicionarPontos,
    pontuar,
    converterParaMoeda,
  }
}

// Componente para exibir saldo de CDCOIN
export function CDCoinDisplay({ saldo, onConvertClick }) {
  const { converterParaMoeda } = useCDCoin()
  const conversao = converterParaMoeda(saldo, 'BRL')

  return (
    <div 
      onClick={onConvertClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        borderRadius: '20px',
        cursor: onConvertClick ? 'pointer' : 'default',
        boxShadow: '0 2px 8px rgba(255,215,0,0.4)',
        transition: 'all 0.3s ease',
      }}
    >
      <span style={{ fontSize: '20px' }}>🪙</span>
      <div>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#fff',
          fontSize: '14px',
        }}>
          {saldo} CDCOIN
        </div>
        <div style={{ 
          fontSize: '10px', 
          color: 'rgba(255,255,255,0.8)',
        }}>
          ≈ {conversao.simbolo} {conversao.valor}
        </div>
      </div>
    </div>
  )
}

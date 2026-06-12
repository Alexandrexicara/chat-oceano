// Componente de Teste para Anúncios Exoclick
// Use este componente para verificar se os anúncios estão carregando corretamente

export function TestExoclickAd() {
  const testAd = () => {
    console.log('=== TESTE DE ANÚNCIOS EXOCLICK ===')
    
    // Verificar se o AdProvider existe
    if (window.AdProvider) {
      console.log('✅ AdProvider está disponível')
      console.log('Tipo:', typeof window.AdProvider)
      console.log('Métodos:', Object.keys(window.AdProvider))
      
      // Tentar servir um anúncio
      try {
        window.AdProvider.push({ "serve": {} })
        console.log('✅ Anúncio solicitado com sucesso')
      } catch (error) {
        console.error('❌ Erro ao solicitar anúncio:', error)
      }
    } else {
      console.log('❌ AdProvider NÃO está disponível')
      console.log('Verifique se o script foi carregado: https://a.magsrv.com/ad-provider.js')
    }
    
    // Verificar elemento ins
    const insElement = document.querySelector('ins.eas6a97888e37')
    if (insElement) {
      console.log('✅ Elemento <ins> encontrado')
      console.log('Zone ID:', insElement.getAttribute('data-zoneid'))
      console.log('Classes:', insElement.className)
    } else {
      console.log('❌ Elemento <ins> NÃO encontrado')
    }
    
    console.log('=== FIM DO TESTE ===')
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#4ade80',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
    }}
    onClick={testAd}
    >
      🧪 Testar Anúncios
    </div>
  )
}

// Criar sons oceânicos em base64
// Sons gerados com Web Audio API

export const createOceanSounds = () => {
  // Som de água/splash
  const createWaterSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    
    // Som tipo "splash"
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3)
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  // Som de ondas
  const createWaveSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    
    // Som tipo "onda"
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.5)
    
    gain.gain.setValueAtTime(0.2, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  return {
    playWater: createWaterSound,
    playWave: createWaveSound,
  }
}

// Simular reprodução de som (sem erro se Web Audio não estiver disponível)
export const playMessageSound = () => {
  try {
    const sounds = createOceanSounds()
    // Toca som de onda quando chega mensagem
    sounds.playWave()
    
    // Toca som de water após 200ms
    setTimeout(() => {
      sounds.playWater()
    }, 200)
  } catch (e) {
    console.log('Web Audio API não disponível')
  }
}

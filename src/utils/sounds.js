// Sons oceânicos com Web Audio API

export const createOceanSounds = () => {
  // Som de splash (água)
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

  // Som de ondas (mais suave e longo)
  const createWaveSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Criar ruído branco para som de ondas
    const bufferSize = audioContext.sampleRate * 1.5 // 1.5 segundos
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    
    const noise = audioContext.createBufferSource()
    noise.buffer = buffer
    
    // Filtro para suavizar o ruído (som de ondas)
    const filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(400, audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1)
    
    // Volume envelope (onda que vem e vai)
    const gain = audioContext.createGain()
    gain.gain.setValueAtTime(0, audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.3)
    gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.8)
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5)
    
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(audioContext.destination)
    
    noise.start(audioContext.currentTime)
    noise.stop(audioContext.currentTime + 1.5)
  }

  // Som de garrafa chegando (splash + onda)
  const createBottleSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Splash inicial
    const oscillator = audioContext.createOscillator()
    const gain1 = audioContext.createGain()
    
    oscillator.connect(gain1)
    gain1.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2)
    
    gain1.gain.setValueAtTime(0.2, audioContext.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
    
    // Onda após o splash
    setTimeout(() => {
      const bufferSize = audioContext.sampleRate * 1.2
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const noise = audioContext.createBufferSource()
      noise.buffer = buffer
      
      const filter = audioContext.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(500, audioContext.currentTime)
      filter.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + 0.8)
      
      const gain2 = audioContext.createGain()
      gain2.gain.setValueAtTime(0, audioContext.currentTime)
      gain2.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.2)
      gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.2)
      
      noise.connect(filter)
      filter.connect(gain2)
      gain2.connect(audioContext.destination)
      
      noise.start(audioContext.currentTime)
      noise.stop(audioContext.currentTime + 1.2)
    }, 200)
  }

  return {
    playWater: createWaterSound,
    playWave: createWaveSound,
    playBottle: createBottleSound,
  }
}

// Som de mensagem normal (onda)
export const playMessageSound = () => {
  try {
    console.log('🔊 Tocando som de mensagem...')
    const sounds = createOceanSounds()
    sounds.playWave()
  } catch (e) {
    console.log('❌ Web Audio API não disponível:', e.message)
  }
}

// Som de garrafa/barril chegando (splash + ondas)
export const playBottleSound = () => {
  try {
    console.log('🔊 Tocando som de garrafa...')
    const sounds = createOceanSounds()
    sounds.playBottle()
    console.log('✅ Som tocado!')
  } catch (e) {
    console.log('❌ Web Audio API não disponível:', e.message)
  }
}

'use client'

import dynamic from 'next/dynamic'

// Carrega o app client-side (usa browser APIs: localStorage, socket.io, MediaDevices)
const App = dynamic(() => import('./src/AppContent'), { ssr: false })

export default function Home() {
  return <App />
}

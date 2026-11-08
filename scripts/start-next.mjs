import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const nextCli = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))
const port = process.env.PORT || '3000'

const child = spawn(process.execPath, [nextCli, 'start', '-p', String(port)], {
  stdio: 'inherit',
  env: process.env,
})

child.on('error', (error) => {
  console.error('Falha ao iniciar o Next.js:', error)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})

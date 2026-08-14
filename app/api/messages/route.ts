import { NextRequest, NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

let initialized = false
async function ensureInit() {
  if (!initialized) { await initOceanosDb(); initialized = true }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// POST /api/messages — enviar mensagem (privada ou oceano)
export async function POST(req: NextRequest) {
  try {
    await ensureInit()
    const db = getDb()
    const body = await req.json()
    const { sender_id, receiver_id, text, media_url, media_type, file_name, is_oceano } = body

    if (!sender_id) return NextResponse.json({ error: 'sender_id é obrigatório' }, { status: 400, headers: cors })

    const senderId = Number(sender_id)
    const receiverId = receiver_id ? Number(receiver_id) : null

    const result = await db`
      INSERT INTO oceanos_messages (sender_id, receiver_id, text, media_url, media_type, file_name, is_oceano)
      VALUES (${senderId}, ${receiverId}, ${text || ''}, ${media_url || null}, ${media_type || null}, ${file_name || null}, ${is_oceano || false})
      RETURNING *
    `

    // Enriquecer com dados do remetente
    const sender = await db`SELECT name, avatar FROM oceanos_users WHERE id = ${senderId} LIMIT 1`
    const msg = { ...result[0], sender_name: sender[0]?.name || 'Usuário', sender_avatar: sender[0]?.avatar || null }

    return NextResponse.json(msg, { status: 201, headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('POST /api/messages error:', msg)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

let initialized = false
async function ensureInit() {
  if (!initialized) { await initOceanosDb(); initialized = true }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// GET /api/messages/[userId1]/[userId2] — mensagens privadas entre dois usuários
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId1: string; userId2: string }> }
) {
  try {
    await ensureInit()
    const db = getDb()
    const { userId1, userId2 } = await params
    const id1 = Number(userId1)
    const id2 = Number(userId2)

    const result = await db`
      SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
      FROM oceanos_messages m
      LEFT JOIN oceanos_users u ON m.sender_id = u.id
      WHERE m.is_oceano = false
        AND ((m.sender_id = ${id1} AND m.receiver_id = ${id2})
          OR (m.sender_id = ${id2} AND m.receiver_id = ${id1}))
      ORDER BY m.created_at ASC
    `
    return NextResponse.json(result, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

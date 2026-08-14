import { NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

let initialized = false
async function ensureInit() {
  if (!initialized) { await initOceanosDb(); initialized = true }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// GET /api/messages/oceano — mensagens públicas do oceano (últimos 7 dias)
export async function GET() {
  try {
    await ensureInit()
    const db = getDb()
    const result = await db`
      SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
      FROM oceanos_messages m
      LEFT JOIN oceanos_users u ON m.sender_id = u.id
      WHERE m.is_oceano = true
        AND m.created_at > NOW() - INTERVAL '7 days'
      ORDER BY m.created_at DESC
      LIMIT 100
    `
    return NextResponse.json(result, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

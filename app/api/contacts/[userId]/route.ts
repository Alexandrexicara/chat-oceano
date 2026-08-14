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

// GET /api/contacts/[userId] — buscar contatos do usuário
export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await ensureInit()
    const db = getDb()
    const { userId } = await params
    const uid = Number(userId)

    if (isNaN(uid)) return NextResponse.json([], { headers: cors })

    const result = await db`
      SELECT u.id, u.name, u.username, u.phone, u.avatar, u.status, u.bio, u.city, u.country
      FROM oceanos_contacts c
      JOIN oceanos_users u ON c.contact_id = u.id
      WHERE c.user_id = ${uid}
      ORDER BY u.name ASC
    `
    return NextResponse.json(result, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('GET contacts error:', msg)
    return NextResponse.json([], { headers: cors })
  }
}

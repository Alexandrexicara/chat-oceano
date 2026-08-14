import { NextRequest, NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

let initialized = false
async function ensureInit() {
  if (!initialized) { await initOceanosDb(); initialized = true }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// POST /api/contacts — adicionar contato
export async function POST(req: NextRequest) {
  try {
    await ensureInit()
    const db = getDb()
    const { user_id, contact_id } = await req.json()

    if (!user_id || !contact_id) return NextResponse.json({ error: 'user_id e contact_id são obrigatórios' }, { status: 400, headers: cors })

    const uid = Number(user_id)
    const cid = Number(contact_id)

    // Verificar se já existe
    const existing = await db`SELECT id FROM oceanos_contacts WHERE user_id = ${uid} AND contact_id = ${cid} LIMIT 1`
    if (existing.length > 0) return NextResponse.json({ message: 'Contato já existe', id: existing[0].id }, { headers: cors })

    const result = await db`
      INSERT INTO oceanos_contacts (user_id, contact_id) VALUES (${uid}, ${cid}) RETURNING *
    `
    return NextResponse.json(result[0], { status: 201, headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

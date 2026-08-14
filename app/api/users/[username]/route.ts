import { NextRequest, NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

let initialized = false
async function ensureInit() {
  if (!initialized) { await initOceanosDb(); initialized = true }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// GET /api/users/[username]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    await ensureInit()
    const db = getDb()
    const { username } = await params
    const result = await db`SELECT * FROM oceanos_users WHERE username = ${username} LIMIT 1`
    if (result.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404, headers: cors })
    return NextResponse.json(result[0], { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

// PUT /api/users/[username] — atualizar perfil (nome, bio, cidade, país, avatar)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    await ensureInit()
    const db = getDb()
    const { username } = await params
    const body = await req.json()
    const { name, bio, city, country, avatar } = body

    // Verificar se usuário existe
    const existing = await db`SELECT id FROM oceanos_users WHERE username = ${username} LIMIT 1`
    if (existing.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404, headers: cors })

    // Atualizar campos fornecidos
    const sets: string[] = []
    const vals: unknown[] = []
    let idx = 1

    if (name !== undefined) { sets.push(`name = $${idx++}`); vals.push(name) }
    if (bio !== undefined) { sets.push(`bio = $${idx++}`); vals.push(bio) }
    if (city !== undefined) { sets.push(`city = $${idx++}`); vals.push(city) }
    if (country !== undefined) { sets.push(`country = $${idx++}`); vals.push(country) }
    if (avatar !== undefined) { sets.push(`avatar = $${idx++}`); vals.push(avatar) }

    if (sets.length === 0) return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400, headers: cors })

    vals.push(username)
    const result = await db.unsafe(`UPDATE oceanos_users SET ${sets.join(', ')} WHERE username = $${idx} RETURNING *`, vals as string[])
    return NextResponse.json(result[0], { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

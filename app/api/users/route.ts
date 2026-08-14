import { NextRequest, NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

let initialized = false
async function ensureInit() {
  if (!initialized) { await initOceanosDb(); initialized = true }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// POST /api/users — criar usuário
export async function POST(req: NextRequest) {
  try {
    await ensureInit()
    const db = getDb()
    const { name, username, phone, bio, city, country, language } = await req.json()
    const result = await db`
      INSERT INTO oceanos_users (name, username, phone, bio, city, country, language)
      VALUES (${name}, ${username}, ${phone || null}, ${bio || 'Novo no Oceanos 🌊'}, ${city || null}, ${country || 'BR'}, ${language || 'pt-BR'})
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201, headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

// POST /api/users/find-by-phones — buscar usuários por telefone
// (tratado em rota separada)

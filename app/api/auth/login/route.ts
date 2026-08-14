import { NextRequest, NextResponse } from 'next/server'
import { getDb, initOceanosDb } from '@/lib/oceanos-db'

// Inicializa tabelas na primeira chamada
let initialized = false
async function ensureInit() {
  if (!initialized) {
    await initOceanosDb()
    initialized = true
  }
}

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

export async function POST(req: NextRequest) {
  try {
    await ensureInit()
    const db = getDb()
    const body = await req.json()
    const { username, name, phone, city, country, language, inviter_id } = body

    if (!username) {
      return NextResponse.json({ error: 'username é obrigatório' }, { status: 400, headers: cors })
    }

    // Buscar usuário existente
    const existing = await db`SELECT * FROM oceanos_users WHERE username = ${username} LIMIT 1`

    if (existing.length === 0) {
      // Criar novo usuário
      const created = await db`
        INSERT INTO oceanos_users (name, username, phone, city, country, language, bio)
        VALUES (${name || username}, ${username}, ${phone || null}, ${city || null}, ${country || 'BR'}, ${language || 'pt-BR'}, 'Novo no Oceanos 🌊')
        RETURNING *
      `
      const newUser = created[0]

      // Se foi convidado, criar contato bidirecional
      if (inviter_id) {
        const invId = Number(inviter_id)
        await db`INSERT INTO oceanos_contacts (user_id, contact_id) VALUES (${invId}, ${newUser.id}) ON CONFLICT DO NOTHING`.catch(() => {})
        await db`INSERT INTO oceanos_contacts (user_id, contact_id) VALUES (${newUser.id}, ${invId}) ON CONFLICT DO NOTHING`.catch(() => {})
      }

      return NextResponse.json(newUser, { headers: cors })
    }

    // Atualizar campos faltantes no usuário existente
    const u = existing[0]
    const updates: string[] = []
    if (phone && !u.phone) updates.push(`phone = '${phone.replace(/'/g, "''")}'`)
    if (city && !u.city) updates.push(`city = '${city.replace(/'/g, "''")}'`)
    if (country && !u.country) updates.push(`country = '${country.replace(/'/g, "''")}'`)
    if (language && !u.language) updates.push(`language = '${language.replace(/'/g, "''")}'`)

    if (updates.length > 0) {
      await db.unsafe(`UPDATE oceanos_users SET ${updates.join(', ')} WHERE username = $1`, [username]).catch(() => {})
      const refreshed = await db`SELECT * FROM oceanos_users WHERE username = ${username} LIMIT 1`
      return NextResponse.json(refreshed[0], { headers: cors })
    }

    return NextResponse.json(u, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Auth login error:', msg)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

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

export async function POST(req: NextRequest) {
  try {
    await ensureInit()
    const db = getDb()
    const { phones } = await req.json()
    if (!phones || !Array.isArray(phones) || phones.length === 0) return NextResponse.json([], { headers: cors })

    const validPhones = phones.filter((p: unknown) => typeof p === 'string' && (p as string).trim().length > 0)
    if (validPhones.length === 0) return NextResponse.json([], { headers: cors })

    const result = await db`
      SELECT id, name, username, phone, avatar, status 
      FROM oceanos_users 
      WHERE phone = ANY(${validPhones})
    `
    return NextResponse.json(result, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('find-by-phones error:', msg)
    return NextResponse.json([], { headers: cors })
  }
}

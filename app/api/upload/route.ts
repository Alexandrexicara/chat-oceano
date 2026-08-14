import { NextRequest, NextResponse } from 'next/server'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

// POST /api/upload — recebe arquivo multipart, armazena como base64 URL
// Em produção real usaria R2/S3. Aqui retornamos uma data URL funcional.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400, headers: cors })
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400, headers: cors })
    }

    // Converter para base64 data URL (funciona sem disco/S3)
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Gerar nome único
    const ext = file.name.split('.').pop() || 'bin'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    return NextResponse.json({
      message: 'Arquivo enviado com sucesso!',
      filename,
      path: dataUrl, // data URL — funciona direto no <img> e <video>
      url: dataUrl,
    }, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

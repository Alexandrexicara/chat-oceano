import { NextRequest, NextResponse } from 'next/server'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors })
}

export async function POST(req: NextRequest) {
  try {
    const { phone, inviterName, inviter_id } = await req.json()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://chat-oceano.happyseeds.ai'
    const inviteLink = inviter_id ? `${baseUrl}?inviter_id=${inviter_id}` : baseUrl

    const message = encodeURIComponent(
      `🌊 Olá! ${inviterName} te convidou para o Oceanos - o mensageiro pirata!\n\n` +
      `Entre agora e venha navegar conosco: ${inviteLink}\n\n` +
      `🏴‍☠️ Cadastre-se e junte-se a nós!`
    )

    const cleanPhone = String(phone).replace(/\D/g, '')
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${message}`

    return NextResponse.json({ success: true, whatsappLink, inviteLink, message: 'Convite pronto para enviar!' }, { headers: cors })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: msg }, { status: 500, headers: cors })
  }
}

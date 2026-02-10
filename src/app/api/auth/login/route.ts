import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcrypt"
import { createToken, setAuthCookie } from "../../../../lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await createToken(user.id, user.email)
    await setAuthCookie(token)

    return NextResponse.json({ ok: true })
    } catch (err: any) {
      console.error(err) // <-- logga l'errore nel terminale
      return NextResponse.json({ error: err && typeof err === "object" && "message" in err ? (err as any).message : "Server error" }, { status: 500 })
  }
}

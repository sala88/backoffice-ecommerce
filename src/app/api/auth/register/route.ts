import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt"
import { createToken, setAuthCookie } from "../../../../lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hash
      }
    })

    const token = await createToken(user.id, user.email)
    await setAuthCookie(token)

    return NextResponse.json({ ok: true })
    } catch (err: any) {
      console.error(err) // <-- logga l'errore nel terminale
      return NextResponse.json({ error: err && typeof err === "object" && "message" in err ? (err as any).message : "Server error" }, { status: 500 })
  }
}
import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcrypt"
import { createToken, setAuthCookie } from "../../../../lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { LoginRequestSchema, LoginResponseSchema } from "../../../../lib/zodSchemas"
import { ErrorResponseSchema } from "../../../../lib/zodSchemas"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parseResult = LoginRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 })
    }
    const { email, password } = parseResult.data
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
    return NextResponse.json({ ok: true, token })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(ErrorResponseSchema.parse({ error: err && typeof err === "object" && "message" in err ? (err as any).message : "Server error" }), { status: 500 })
  }
}

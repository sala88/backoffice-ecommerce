import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { createToken, setAuthCookie } from "../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { RegisterRequestSchema, RegisterResponseSchema, ErrorResponseSchema } from "../../../../lib/openapi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RegisterRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }
    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUser) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hash
      }
    });
    const token = await createToken(user.id, user.email);
    await setAuthCookie(token);
    return NextResponse.json(RegisterResponseSchema.parse({ ok: true }));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(ErrorResponseSchema.parse({ error: err && typeof err === "object" && "message" in err ? (err as any).message : "Server error" }), { status: 500 });
  }
}
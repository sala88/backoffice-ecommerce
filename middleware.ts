import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://app.miosito.it",
]

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin")
  const res = NextResponse.next()

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin)
    res.headers.set("Access-Control-Allow-Credentials", "true")
  }

  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  )
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )

  // Gestione preflight OPTIONS
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: res.headers,
    })
  }

  return res
}

export const config = {
  matcher: "/api/:path*",
}
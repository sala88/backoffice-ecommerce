import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json({ error: "Errore caricamento prodotti" }, { status: 500 });
  }
}

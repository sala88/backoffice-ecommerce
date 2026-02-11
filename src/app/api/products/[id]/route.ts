import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductSchema, ProductInputSchema } from "@/lib/zodSchemas";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    let params = (context as any).params;
    if (typeof params.then === "function") {
      params = await params;
    }
    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Parametro id mancante o non valido" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({
      where: { id: String(id) },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Serializza le date per Zod
    const productSerialized = {
      ...product,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    };
    const parsed = ProductSchema.safeParse(productSerialized);
    if (!parsed.success) {
      console.error("Errore validazione prodotto:", parsed.error);
      return NextResponse.json(
        { error: "Errore validazione prodotto" },
        { status: 500 }
      );
    }
    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore caricamento prodotto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    let params = (context as any).params;
    if (typeof params.then === "function") {
      params = await params;
    }
    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Parametro id mancante o non valido" }, { status: 400 });
    }
    const data = await req.json();
    const parsed = ProductInputSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati prodotto non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const product = await prisma.product.update({
      where: { id: String(id) },
      data: parsed.data,
    });
    // Serializza le date per Zod
    const productSerialized = {
      ...product,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    };
    const productParsed = ProductSchema.safeParse(productSerialized);
    if (!productParsed.success) {
      console.error("Errore validazione prodotto aggiornato:", productParsed.error);
      return NextResponse.json(
        { error: "Errore validazione prodotto aggiornato" },
        { status: 500 }
      );
    }
    return NextResponse.json(productParsed.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore aggiornamento prodotto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    let params = (context as any).params;
    if (typeof params.then === "function") {
      params = await params;
    }
    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Parametro id mancante o non valido" }, { status: 400 });
    }
    await prisma.product.delete({
      where: { id: String(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Errore eliminazione prodotto" },
      { status: 500 }
    );
  }
}

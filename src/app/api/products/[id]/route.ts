import { getAuthToken, verifyToken } from "@/lib/auth";
import { validateProductRow, updateProductWithSnapshot } from "@/lib/productValidation";
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
    // Use shared validation
    const { valid, errors, data: validatedData } = validateProductRow({
      name: data.name,
      description: data.description,
      price: Number(data.price),
      discountPct: data.discountPct !== undefined && data.discountPct !== null ? Number(data.discountPct) : 0,
    });
    if (!valid) {
      return NextResponse.json({ error: "Dati prodotto non validi", details: errors }, { status: 400 });
    }
    // Extract user id from token
    let userId = "system";
    const authToken = await getAuthToken();
    if (authToken) {
      const payload = await verifyToken(authToken);
      if (payload && payload.userId) {
        userId = String(payload.userId);
      }
    }
    // Use shared update logic
    const updated = await updateProductWithSnapshot(String(id), {
      ...validatedData,
      isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
      userId,
    });
    // Serializza le date per Zod
    const productSerialized = {
      ...updated,
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
      updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : updated.updatedAt,
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


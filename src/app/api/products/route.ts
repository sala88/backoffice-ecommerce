import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { ProductSchema, PaginatedProductsSchema } from "@/lib/zodSchemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawPageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const pageSize =
      Number.isNaN(rawPageSize) || rawPageSize < 1
        ? 10
        : Math.min(rawPageSize, 100);

    const skip = (page - 1) * pageSize;


    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          discountPct: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);




    const responseData = {
      products: products.map((p) => {
        const discount = typeof p.discountPct === "number" && p.discountPct > 0 ? (p.price * p.discountPct) / 100 : 0;
        let totale = Math.round((p.price - discount) * 100) / 100;
        if (totale < 0) totale = 0;
        return {
          ...p,
          totale,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
          updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        };
      }),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    // Validazione Zod
    const parsed = PaginatedProductsSchema.safeParse(responseData);
    if (!parsed.success) {
      console.error("Errore validazione risposta prodotti:", parsed.error);
      return NextResponse.json(
        { error: "Errore validazione risposta prodotti" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (err: any) {
    console.error("Errore caricamento prodotti:", err);
    return NextResponse.json(
      { error: "Errore caricamento prodotti" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { ProductInputSchema } from "@/lib/zodSchemas";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { bucket, key } = await req.json();

    if (!bucket || !key) {
      return NextResponse.json(
        { error: "Missing bucket or key" },
        { status: 400 }
      );
    }

    // 🔽 Scarica file
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await client.send(command);

    const streamToString = async (stream: any): Promise<string> => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks).toString("utf-8");
    };

    const csvContent = await streamToString(response.Body);


    // 🔽 Parsing
    let records: string[][];
    try {
      records = parse(csvContent, {
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      return NextResponse.json(
        { error: "CSV non valido" },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: "CSV vuoto" },
        { status: 400 }
      );
    }

    // 🔽 Salta intestazione se presente
    const [firstRow, ...restRows] = records;
    const isHeader = firstRow && firstRow[0]?.toLowerCase().includes("nome");
    const dataRows = isHeader ? restRows : records;

    // 🔽 Validazione completa con Zod
    const validatedProducts = dataRows.map((row, index) => {
      const [name, description, price, discountPct] = row;
      const parsedPrice = parseFloat(price);
      const parsedDiscount = discountPct ? parseFloat(discountPct) : null;
      const parsed = ProductInputSchema.safeParse({
        name,
        description,
        price: parsedPrice,
        discountPct: parsedDiscount,
      });
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((e: any) => e.message).join(", ");
        throw new Error(`Riga ${index + 1}: ${errorMsg}`);
      }
      return parsed.data;
    });

    // 🔽 Transaction + chunking
    await prisma.$transaction(async (tx) => {
      const chunkSize = 1000;

      for (let i = 0; i < validatedProducts.length; i += chunkSize) {
        const chunk = validatedProducts.slice(i, i + chunkSize);

        await tx.product.createMany({
          data: chunk,
        });
      }
    });

    return NextResponse.json({
      message: `Importazione completata: ${validatedProducts.length} prodotti.`,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Errore durante l'importazione" },
      { status: 500 }
    );
  }
}

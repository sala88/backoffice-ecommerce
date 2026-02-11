import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const { bucket, key } = await req.json();
    if (!bucket || !key) {
      return NextResponse.json({ error: "Missing bucket or key" }, { status: 400 });
    }
    // Scarica il file dal bucket
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await client.send(command);
    // Leggi il contenuto del CSV
    const streamToString = (stream: any) =>
      new Promise<string>((resolve, reject) => {
        const chunks: any[] = [];
        stream.on("data", (chunk: any) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        stream.on("error", reject);
      });
    const csvContent = await streamToString(response.Body);
    // Parsing robusto con csv-parse
    let records;
    try {
      records = parse(csvContent, {
        columns: false,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      return NextResponse.json({ error: "CSV non valido" }, { status: 400 });
    }
    let imported = 0;
    let errors: string[] = [];
    for (let i = 0; i < records.length; i++) {
      const [name, description, price, discountPct] = records[i];
      if (!name || !description || !price) {
        errors.push(`Riga ${i+1}: campi obbligatori mancanti`);
        continue;
      }
      try {
        await prisma.product.create({
          data: {
            name,
            description,
            price: parseFloat(price),
            discountPct: discountPct ? parseFloat(discountPct) : null,
            discountPct: discountPct ? parseFloat(discountPct) : null,
          }
        });
        imported++;
      } catch (err) {
        errors.push(`Riga ${i+1}: errore inserimento DB`);
      }
    }
    return NextResponse.json({ message: `Importazione completata: ${imported} prodotti.`, errors });
  } catch (err) {
    return NextResponse.json({ error: "Errore durante la processazione del CSV" }, { status: 500 });
  }
}

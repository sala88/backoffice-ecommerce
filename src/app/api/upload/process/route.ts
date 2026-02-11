import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import { ProductInputSchema } from "@/lib/zodSchemas";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getAuthToken, verifyToken } from "@/lib/auth";

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
    // L'ETag di S3 è l'MD5 per file non multipart
    const fileHash = response.ETag ? String(response.ETag).replaceAll('"', '') : null;

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
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: "CSV non valido", details: parseErr.message, csvPreview: csvContent.slice(0, 200) },
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


    // 🔽 Validazione completa con Zod, raccolta errori multipli
    const validatedProducts: any[] = [];
    const validationErrors: { row: number, error: string }[] = [];
    const seenNames = new Set<string>();
    dataRows.forEach((row, index) => {
      const [name, description, price, discountPct] = row;
      if (parseFloat(price) <= 0 || isNaN(parseFloat(price))) {
        validationErrors.push({ row: index + 2, error: "Prezzo deve essere maggiore di 0" });
        return;
      }
      if (!name) {
        validationErrors.push({ row: index + 2, error: "Nome mancante" });
        return;
      }
      if (seenNames.has(name)) {
        validationErrors.push({ row: index + 2, error: "Nome duplicato nel file" });
        return;
      }
      seenNames.add(name);
      let discountValue = discountPct;
      if (discountPct == null || discountPct === "" || isNaN(parseFloat(discountPct))) {
        discountValue = 0;
      } else {
        discountValue = parseFloat(discountPct);
      }
      // Controllo intero positivo tra 0 e 100
      if (!Number.isInteger(discountValue) || discountValue < 0 || discountValue > 100) {
        validationErrors.push({ row: index + 2, error: "Sconto deve essere un intero tra 0 e 100" });
        return;
      }
      const parsed = ProductInputSchema.safeParse({
        name,
        description,
        price: parseFloat(price),
        discountPct: discountValue,
      });
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((e: any) => e.message).join(", ");
        validationErrors.push({ row: index + 2, error: errorMsg });
        return;
      }
      validatedProducts.push(parsed.data);
    });
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Errori di validazione CSV", validationErrors }, { status: 400 });
    }


    // 🔽 Import atomico con snapshot, versionamento, error report
    const errorRows: any[] = [];
    let insertedRows = 0;
    let updatedRows = 0;
    let totalRows = validatedProducts.length;



    // Estrai id utente dal token
    const authToken = await getAuthToken();
    let createdById = "";
    if (authToken) {
      const payload = await verifyToken(authToken);
      if (payload && payload.userId) {
        createdById = String(payload.userId);
      } else {
        return NextResponse.json({ error: "Token non valido" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Token mancante" }, { status: 401 });
    }
    const fileName = key;

    // Impedisci doppio import dello stesso file (stesso hash)
    if (fileHash) {
      const alreadyImported = await prisma.$transaction(async (tx) => {
        return await tx.productImport.findUnique({ where: { fileHash } });
      });
      if (alreadyImported) {
        return NextResponse.json({ error: "Questo file è già stato importato." }, { status: 400 });
      }
    }

    let importRecord;
    try {
      importRecord = await prisma.productImport.create({
        data: {
          fileName,
          fileHash,
          status: "PENDING",
          createdById,
          totalRows,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        return NextResponse.json({ error: "File già importato" }, { status: 400 });
      }
      throw e;
    }
    const importId = importRecord.id;

    let finalStatus = "COMPLETED";
    try {
      await prisma.$transaction(async (tx) => {
        const names = validatedProducts.map(p => p.name);
        const existingProducts = await tx.product.findMany({
          where: { name: { in: names } }
        });
        const existingMap = new Map(existingProducts.map(p => [p.name, p]));
        for (let i = 0; i < validatedProducts.length; i++) {
          const row = validatedProducts[i];
          try {
            const existing = existingMap.get(row.name);
            if (!existing) {
              // Nuovo prodotto
              const created = await tx.product.create({
                data: { ...row, lastImportId: importId }
              });
              await tx.productSnapshot.create({
                data: { productId: created.id, importId, ...row, version: created.version }
              });
              existingMap.set(created.name, created);
              insertedRows++;
            } else {
              const hasChanged =
                existing.description !== row.description ||
                Math.abs(existing.price - row.price) > 0.0001 ||
                existing.discountPct !== row.discountPct ||
                existing.isActive !== true;
              if (hasChanged) {
                const updated = await tx.product.update({
                  where: { name: row.name },
                  data: { ...row, isActive: true, version: { increment: 1 }, lastImportId: importId }
                });
                await tx.productSnapshot.create({
                  data: { productId: updated.id, importId, ...row, version: updated.version }
                });
                updatedRows++;
              }
            }
          } catch (err: any) {
            errorRows.push({ row: i + 1, error: err.message || "Errore sconosciuto", details: err });
          }
        }
        // Disattiva tutti i prodotti non presenti nell'import corrente
        await tx.product.updateMany({
          where: {
            name: { notIn: names }
          },
          data: {
            isActive: false
          }
        });
        if (errorRows.length > 0) {
          finalStatus = "FAILED";
        }
      });
    } catch (e) {
      finalStatus = "FAILED";
    }
    await prisma.productImport.update({
      where: { id: importId },
      data: {
        status: finalStatus,
        insertedRows,
        updatedRows,
        errorRows: errorRows.length,
        errorReport: errorRows.length ? errorRows : null
      }
    });

    return NextResponse.json({
      message: `Importazione completata: ${totalRows} righe, inseriti: ${insertedRows}, aggiornati: ${updatedRows}, errori: ${errorRows.length}`,
      errorReport: errorRows.length > 0 ? errorRows : undefined,
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Errore durante l'importazione" },
      { status: 500 }
    );
  }
}

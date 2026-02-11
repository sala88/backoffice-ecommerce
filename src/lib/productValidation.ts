import { ProductInputSchema } from "./zodSchemas";
import { prisma } from "./prisma";

const forbidden = ["''", '"'];

export function validateProductRow(row: { name: string; description: string; price: number; discountPct: number | null }) {
  const errors: string[] = [];
  // Forbidden substrings check
  const fields = [row.name, row.description, String(row.price), String(row.discountPct ?? "")];
  if (fields.some(field => typeof field === "string" && forbidden.some(char => field.includes(char)))) {
    errors.push(`Il prodotto contiene caratteri non ammessi (${forbidden.join(", ")})`);
  }
  // Price validation
  if (row.price <= 0 || isNaN(row.price)) {
    errors.push("Prezzo deve essere maggiore di 0");
  }
  // Discount validation
  const discountValue = row.discountPct ?? 0;
  if (!Number.isInteger(discountValue) || discountValue < 0 || discountValue > 100) {
    errors.push("Sconto deve essere un intero tra 0 e 100");
  }
  // Zod schema validation
  const parsed = ProductInputSchema.safeParse({
    name: row.name,
    description: row.description,
    price: row.price,
    discountPct: discountValue,
  });
  if (!parsed.success) {
    errors.push(parsed.error.issues.map(e => e.message).join(", "));
  }
  return { valid: errors.length === 0, errors, data: parsed.success ? parsed.data : null };
}

export async function updateProductWithSnapshot(id: string, data: { name: string; description: string; price: number; discountPct: number | null; isActive?: boolean; lastImportId?: string, userId?: string }) {
  // Logical delete: if isActive is false, treat as delete
  const isDelete = data.isActive === false;
  const importType = isDelete ? "manual-delete" : "manual-edit";
  const importStatus = "COMPLETED";
  // Create ProductImport for manual edit/delete
  const importRecord = await prisma.productImport.create({
    data: {
      fileName: `${importType}-${id}`,
      fileHash: `${importType}-${id}-${Date.now()}`,
      status: importStatus,
      totalRows: 1,
      insertedRows: isDelete ? 0 : 0,
      updatedRows: isDelete ? 0 : 1,
      errorRows: 0,
      createdById: data.userId ?? "system",
    },
  });
  // Remove userId from product update data
  const { userId, ...productData } = data;
  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      isActive: data.isActive ?? true,
      version: { increment: 1 },
      lastImportId: importRecord.id,
    },
  });
  // Create snapshot
  await prisma.productSnapshot.create({
    data: {
      productId: updated.id,
      importId: importRecord.id,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      discountPct: updated.discountPct,
      version: updated.version,
    },
  });
  return updated;
}

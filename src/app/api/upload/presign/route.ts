import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }
    // Configura il bucket come preferisci
    const bucket = process.env.STORAGE_BUCKET || "uploads";
    const key = filename;
    const expiresIn = 900;
    const resolvedContentType = contentType || "application/octet-stream";
    const url = await getPresignedUploadUrl({
      bucket,
      key,
      contentType: resolvedContentType,
      expiresIn,
    });
    return NextResponse.json({
      url,
      bucket,
      key,
      contentType: resolvedContentType,
      expiresIn
    });
  } catch (err) {
    return NextResponse.json({ error: "Errore generazione presigned url" }, { status: 500 });
  }
}

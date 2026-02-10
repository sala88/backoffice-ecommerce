import { swaggerDocument } from '@/server/swagger/swagger';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(swaggerDocument);
}

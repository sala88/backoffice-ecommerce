import { swaggerDocument } from '../../../lib/swagger';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(swaggerDocument);
}

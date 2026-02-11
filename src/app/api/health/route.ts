import { NextResponse } from 'next/server';
import { HealthResponseSchema } from '../../../../lib/openapi';

export async function GET() {
  return NextResponse.json(
    HealthResponseSchema.parse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Server is running',
    }),
    { status: 200 }
  );
}

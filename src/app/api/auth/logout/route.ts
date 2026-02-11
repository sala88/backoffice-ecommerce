import { clearAuthCookie } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import { LogoutResponseSchema, ErrorResponseSchema } from '../../../../lib/openapi';

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json(LogoutResponseSchema.parse({ message: 'Logout successful' }), { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(ErrorResponseSchema.parse({ error: 'Internal server error' }), { status: 500 });
  }
}

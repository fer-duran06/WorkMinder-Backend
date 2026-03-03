// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { verifyAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const userId = await verifyAuth(request);

    // Obtener usuario
    const user = await AuthService.getUserById(userId);

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 401 });
  }
}
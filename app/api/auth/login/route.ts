// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { z } from 'zod';

// Schema de validación
const loginSchema = z.object({
  correo_electronico: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(1, 'La contraseña es requerida')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0]?.message || 'Datos inválidos'
      }, { status: 400 });
    }

    const { correo_electronico, contrasena } = validation.data;

    // Login
    const result = await AuthService.login(correo_electronico, contrasena);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 401 });
  }
}
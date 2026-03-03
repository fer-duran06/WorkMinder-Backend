// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { z } from 'zod';

// Schema de validación
const registerSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  correo_electronico: z.string().email('Correo electrónico inválido'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: validation.error.issues[0]?.message || 'Datos inválidos'
      }, { status: 400 });
    }

    const { nombre_completo, correo_electronico, contrasena } = validation.data;

    // Registrar usuario
    const result = await AuthService.register(
      nombre_completo,
      correo_electronico,
      contrasena
    );

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}
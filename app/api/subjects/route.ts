// app/api/subjects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { SubjectsService } from '@/services/SubjectsService';
import { z } from 'zod';

const createSubjectSchema = z.object({
  periodo_id: z.string().uuid('periodo_id debe ser un UUID válido'),
  nombre: z.string().min(1).max(100),
  nombre_profesor: z.string().max(100).optional(),
  creditos: z.number().int().min(0).max(20).optional(),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hex válido ej: #FF5733').optional()
});

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const soloActivas = searchParams.get('active') === 'true';

    const materias = soloActivas
      ? await SubjectsService.getActiveByUser(userId)
      : await SubjectsService.getByUser(userId);

    return NextResponse.json({ success: true, data: materias });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    const body = await request.json();
    const validation = createSubjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const materia = await SubjectsService.create(validation.data);
    return NextResponse.json({ success: true, data: materia }, { status: 201 });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
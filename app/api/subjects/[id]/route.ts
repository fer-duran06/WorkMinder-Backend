// app/api/subjects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { SubjectsService } from '@/services/SubjectsService';
import { z } from 'zod';

const updateSubjectSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  nombre_profesor: z.string().max(100).optional(),
  creditos: z.number().int().min(0).max(20).optional(),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id } = await params;

    const materia = await SubjectsService.getById(id, userId);

    if (!materia) {
      return NextResponse.json({ success: false, error: 'Materia no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: materia });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id } = await params;

    const body = await request.json();
    const validation = updateSubjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const materia = await SubjectsService.update(id, userId, validation.data);

    if (!materia) {
      return NextResponse.json({ success: false, error: 'Materia no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: materia });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    const { id } = await params;

    const deleted = await SubjectsService.delete(id, userId);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Materia no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Materia eliminada correctamente' });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
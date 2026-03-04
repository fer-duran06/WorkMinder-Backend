// app/api/academic-terms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { AcademicTermsService } from '@/services/AcademicTermsService';
import { z } from 'zod';

const createTermSchema = z.object({
  nombre: z.string().min(1).max(100),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  es_activo: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    const periodos = await AcademicTermsService.getByUser(userId);
    return NextResponse.json({ success: true, data: periodos });

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
    const validation = createTermSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      );
    }

    const periodo = await AcademicTermsService.create(userId, validation.data);
    return NextResponse.json({ success: true, data: periodo }, { status: 201 });

  } catch (error: any) {
    const isAuthError = error.message.includes('Token') || error.message.includes('autenticación');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
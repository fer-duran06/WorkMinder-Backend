// app/api/tasks/prioritized/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TasksService } from '@/services/TasksService';
import { verifyAuth } from '@/lib/middleware/auth';

/**
 * GET /api/tasks/prioritized
 * Obtener tareas ordenadas por prioridad (endpoint principal)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);

    const tasks = await TasksService.getPrioritized(userId);

    return NextResponse.json({
      success: true,
      data: tasks,
      meta: {
        total: tasks.length,
        algorithm: 'Urgencia = ((Importancia * 3) + (Complejidad * 2)) / (Días para la entrega + 1)'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.message === 'Token inválido o expirado' ? 401 : 500 });
  }
}
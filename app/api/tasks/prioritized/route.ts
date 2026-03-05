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
        algorithm: 'P(t) = 0.6·I(t) + 0.4·U(t)'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.message === 'Token inválido o expirado' ? 401 : 500 });
  }
}
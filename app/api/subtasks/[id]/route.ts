import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { supabase } from '@/lib/supabase/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params

    // Verificar que la subtarea pertenece al usuario via la tarea padre
    const { data: subtask } = await supabase
      .from('subtasks')
      .select('subtask_id, is_completed, task_id')
      .eq('subtask_id', id)
      .single()

    if (!subtask) {
      return NextResponse.json(
        { success: false, error: 'Subtarea no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la tarea padre pertenece al usuario
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', subtask.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Toggle: si está completada la desmarca, si no la marca
    const { data: updated, error } = await supabase
      .from('subtasks')
      .update({ is_completed: !subtask.is_completed })
      .eq('subtask_id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data: updated })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params

    // Verificar propiedad via tarea padre
    const { data: subtask } = await supabase
      .from('subtasks')
      .select('subtask_id, task_id')
      .eq('subtask_id', id)
      .single()

    if (!subtask) {
      return NextResponse.json(
        { success: false, error: 'Subtarea no encontrada' },
        { status: 404 }
      )
    }

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', subtask.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('subtask_id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, message: 'Subtarea eliminada' })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
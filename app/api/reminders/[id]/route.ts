import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { supabase } from '@/lib/supabase/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params

    // Verificar propiedad via tarea padre
    const { data: reminder } = await supabase
      .from('reminders')
      .select('reminder_id, task_id')
      .eq('reminder_id', id)
      .single()

    if (!reminder) {
      return NextResponse.json(
        { success: false, error: 'Recordatorio no encontrado' },
        { status: 404 }
      )
    }

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', reminder.task_id)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('reminder_id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, message: 'Recordatorio eliminado' })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
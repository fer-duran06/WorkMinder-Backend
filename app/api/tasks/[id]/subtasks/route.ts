import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { supabase } from '@/lib/supabase/client'
import { z } from 'zod'

const createSubtaskSchema = z.object({
  subtask_name: z.string().min(1, 'El nombre es requerido').max(200)
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id: taskId } = await params

    // Verificar que la tarea pertenece al usuario
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    const { data: subtasks, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data: subtasks })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id: taskId } = await params

    const body = await request.json()
    const validation = createSubtaskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      )
    }

    // Verificar que la tarea pertenece al usuario
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    const { data: subtask, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        subtask_name: validation.data.subtask_name,
        is_completed: false
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data: subtask }, { status: 201 })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
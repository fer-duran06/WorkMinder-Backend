import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { TasksService } from '@/services/TasksService'
import { z } from 'zod'

const updateTaskSchema = z.object({
  task_title: z.string().min(1).max(200).optional(),
  extra_note: z.string().max(1000).optional(),
  due_date: z.string().optional(),
  importance: z.number().int().min(1).max(5).optional(),
  complexity: z.number().int().min(1).max(5).optional(),
  subject_id: z.string().uuid().optional(),
  task_status: z.enum([
  'Pendiente',
  'Completada',
  'Atrasada'
]).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params
    const task = await TasksService.getById(id, userId)
    return NextResponse.json({ success: true, data: task })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params
    const body = await request.json()
    const validation = updateTaskSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const task = await TasksService.update(id, userId, validation.data)
    return NextResponse.json({ success: true, data: task })

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
    await TasksService.delete(id, userId)
    return NextResponse.json({ success: true, message: 'Tarea eliminada' })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
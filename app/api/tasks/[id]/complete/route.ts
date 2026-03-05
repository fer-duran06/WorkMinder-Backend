import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { TasksService } from '@/services/TasksService'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params
    const task = await TasksService.complete(id, userId)
    return NextResponse.json({ success: true, data: task })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
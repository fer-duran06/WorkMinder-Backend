import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { SubjectsService } from '@/services/SubjectsService'
import { z } from 'zod'

const updateSubjectSchema = z.object({
  subject_name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    const { id } = await params
    const subject = await SubjectsService.getById(id, userId)

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: subject })

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
    const validation = updateSubjectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const subject = await SubjectsService.update(id, userId, validation.data)
    return NextResponse.json({ success: true, data: subject })

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
    await SubjectsService.delete(id, userId)
    return NextResponse.json({ success: true, message: 'Materia eliminada' })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/middleware/auth'
import { SubjectsService } from '@/services/SubjectsService'
import { z } from 'zod'

const createSubjectSchema = z.object({
  subject_name: z.string().min(1, 'El nombre es requerido').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido').optional()
})

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    const subjects = await SubjectsService.getAll(userId)
    return NextResponse.json({ success: true, data: subjects })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    const body = await request.json()
    const validation = createSubjectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message },
        { status: 400 }
      )
    }

    const subject = await SubjectsService.create(userId, validation.data)
    return NextResponse.json({ success: true, data: subject }, { status: 201 })

  } catch (error: any) {
    const isAuthError = error.message.includes('Token')
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
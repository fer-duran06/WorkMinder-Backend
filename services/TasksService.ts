import { supabase } from '@/lib/supabase/client'

// Calcula urgency como P(t) = importance * complexity / días restantes
function calcularUrgency(importance: number, complexity: number, dueDate: string): number {
  const diasRestantes = Math.max(
    1,
    Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  )
  return Math.round(((importance * complexity) / diasRestantes) * 10000) / 10000
}

export class TasksService {

  static async getAll(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, subjects (id, subject_name, color)`)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })

    if (error) throw new Error(error.message)
    return data
  }

  static async getPrioritized(userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, subjects (id, subject_name, color)`)
      .eq('user_id', userId)
      .neq('task_status', 'Completada')
      .order('due_date', { ascending: true })

    if (error) throw new Error(error.message)

    const now = new Date()
    return data
      .map(task => {
        const diasRestantes = Math.max(
          1,
          Math.ceil((new Date(task.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        )
        const prioridad = ((task.importance ?? 3) * (task.complexity ?? 3)) / diasRestantes
        return { ...task, prioridad }
      })
      .sort((a, b) => b.prioridad - a.prioridad)
  }

  static async getById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        subjects (id, subject_name, color),
        subtasks (subtask_id, subtask_name, is_completed)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async create(userId: string, data: {
    task_title: string
    extra_note?: string
    due_date: string
    importance?: number
    complexity?: number
    subject_id?: string
  }) {
    const importance = data.importance ?? 3
    const complexity = data.complexity ?? 3
    const urgency = calcularUrgency(importance, complexity, data.due_date)

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        task_title: data.task_title,
        extra_note: data.extra_note,
        due_date: data.due_date,
        importance,
        complexity,
        urgency,
        subject_id: data.subject_id ?? null,
        task_status: 'Pendiente'
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return task
  }

  static async update(id: string, userId: string, data: {
    task_title?: string
    extra_note?: string
    due_date?: string
    importance?: number
    complexity?: number
    subject_id?: string
    task_status?: string
  }) {
    // Si se actualizan campos que afectan urgency, recalcularla
    if (data.due_date || data.importance || data.complexity) {
      const { data: existing } = await supabase
        .from('tasks')
        .select('importance, complexity, due_date')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (existing) {
        const importance = data.importance ?? existing.importance ?? 3
        const complexity = data.complexity ?? existing.complexity ?? 3
        const dueDate = data.due_date ?? existing.due_date
        data = { ...data, urgency: calcularUrgency(importance, complexity, dueDate) } as any
      }
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return task
  }

  static async complete(id: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        task_status: 'Completada',
        completed_at: new Date().toISOString(),
        urgency: 0
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return true
  }
}
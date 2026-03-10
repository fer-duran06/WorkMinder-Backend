import { supabase } from '@/lib/supabase/client'
import { calcularUrgencia } from '@/utils/urgency'

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

    return data
      .map(task => {
        const urgency = calcularUrgencia(
          task.importance ?? 3,
          task.complexity ?? 3,
          task.due_date
        )
        return { ...task, urgency }
      })
      .sort((a, b) => b.urgency - a.urgency)
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
    extra_note?: string | null
    due_date: string
    importance?: number
    complexity?: number
    subject_id?: string | null
  }) {
    const importance = data.importance ?? 3
    const complexity = data.complexity ?? 3
    const urgency = calcularUrgencia(importance, complexity, data.due_date)

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
        task_status: 'Pendiente',
        completed_at: null
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return task
  }

  static async update(id: string, userId: string, data: {
    task_title?: string
    extra_note?: string | null
    due_date?: string
    importance?: number | null
    complexity?: number | null
    subject_id?: string | null
    task_status?: string
  }) {
    // Recalcular urgencia si cambian campos que la afectan
    let updateData: any = { ...data }

    if (data.due_date || data.importance || data.complexity) {
      const { data: existing } = await supabase
        .from('tasks')
        .select('importance, complexity, due_date, task_status')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (existing) {
        const importance = data.importance ?? existing.importance ?? 3
        const complexity = data.complexity ?? existing.complexity ?? 3
        const dueDate = data.due_date ?? existing.due_date
        updateData.urgency = calcularUrgencia(importance, complexity, dueDate)
      }
    }

    // Manejar completed_at según el estatus
    if (data.task_status === 'Completada') {
      updateData.completed_at = new Date().toISOString()
    } else if (data.task_status === 'Pendiente' || data.task_status === 'Atrasada') {
      updateData.completed_at = null
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
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
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async reopen(id: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        task_status: 'Pendiente',
        completed_at: null
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async deleteExpiredCompleted(userId: string) {
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .eq('task_status', 'Completada')
      .lt('completed_at', hace7Dias.toISOString())

    if (error) throw new Error(error.message)
    return true
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
import { supabase } from '@/lib/supabase/client'

export class SubjectsService {

  static async getAll(userId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('subject_name', { ascending: true })

    if (error) throw new Error(error.message)
    return data
  }

  static async getById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async create(userId: string, data: {
    subject_name: string
    color?: string
  }) {
    const { data: subject, error } = await supabase
      .from('subjects')
      .insert({
        user_id: userId,
        subject_name: data.subject_name,
        color: data.color ?? '#3b82f6'
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return subject
  }

  static async update(id: string, userId: string, data: {
    subject_name?: string
    color?: string
  }) {
    const { data: subject, error } = await supabase
      .from('subjects')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return subject
  }

  static async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
    return true
  }
}
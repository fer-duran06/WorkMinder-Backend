import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Cliente con service_role — para operaciones del servidor (Next.js API routes)
// Bypasea RLS, tiene acceso total. NUNCA exponerlo al frontend.
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cliente con anon key — para operaciones en nombre del usuario autenticado
// Respeta las RLS policies. Se usa cuando queremos validar permisos por usuario.
export const supabaseAnon = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
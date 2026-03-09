-- ==========================================
-- WorkMinder - Schema Base de Datos
-- ==========================================

-- Tabla de perfiles (se crea automáticamente al registrar usuario en Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de materias
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  task_title TEXT NOT NULL,
  extra_note TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  importance INTEGER CHECK (importance BETWEEN 1 AND 5),
  complexity INTEGER CHECK (complexity BETWEEN 1 AND 5),
  urgency FLOAT,
  task_status TEXT DEFAULT 'Pendiente' CHECK (task_status IN ('Pendiente', 'Completada', 'Atrasada')),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de subtareas
CREATE TABLE IF NOT EXISTS subtasks (
  subtask_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  subtask_name TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE
);

-- Tabla de recordatorios
CREATE TABLE IF NOT EXISTS reminders (
  reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reminder_datetime TIMESTAMPTZ NOT NULL
);

-- ==========================================
-- Trigger: crear perfil automáticamente al registrar usuario
-- ==========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- RLS (Row Level Security)
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuario ve su perfil" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Políticas para subjects
CREATE POLICY "Usuario gestiona sus materias" ON subjects
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para tasks
CREATE POLICY "Usuario gestiona sus tareas" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para subtasks
CREATE POLICY "Usuario gestiona sus subtareas" ON subtasks
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM tasks WHERE id = task_id)
  );

-- Políticas para reminders
CREATE POLICY "Usuario gestiona sus recordatorios" ON reminders
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM tasks WHERE id = task_id)
  );
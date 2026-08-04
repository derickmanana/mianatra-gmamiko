ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS max_users integer;

CREATE TABLE public.folder_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX folder_students_unique ON public.folder_students (folder_id, lower(student_name));
GRANT ALL ON public.folder_students TO service_role;
ALTER TABLE public.folder_students ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
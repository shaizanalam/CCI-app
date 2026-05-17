-- Stream-based access control for Classes 11–12 (PCM / PCB / Commerce)
-- Class 9/10: stream remains NULL; subjects use stream_access = 'all'

-- ===== Columns =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stream TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_stream_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_stream_check
  CHECK (stream IS NULL OR stream IN ('pcm', 'pcb', 'commerce'));

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS stream_access TEXT NOT NULL DEFAULT 'all';

ALTER TABLE public.subjects
  DROP CONSTRAINT IF EXISTS subjects_stream_access_check;

ALTER TABLE public.subjects
  ADD CONSTRAINT subjects_stream_access_check
  CHECK (stream_access IN ('all', 'shared_science', 'pcm', 'pcb', 'commerce'));

CREATE INDEX IF NOT EXISTS idx_subjects_stream_access ON public.subjects(stream_access);
CREATE INDEX IF NOT EXISTS idx_profiles_stream ON public.profiles(stream);

-- Backfill existing rows (safe defaults)
UPDATE public.profiles SET stream = NULL WHERE stream IS NOT NULL AND class IN ('9', '10');
UPDATE public.subjects SET stream_access = 'all' WHERE stream_access IS NULL;

-- ===== Helpers =====
CREATE OR REPLACE FUNCTION public.current_stream(_user_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT stream FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.can_access_subject_stream(_user_id UUID, _stream_access TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _class public.class_level;
  _stream TEXT;
BEGIN
  SELECT class, stream INTO _class, _stream FROM public.profiles WHERE id = _user_id;

  IF _class IS NULL OR _stream_access IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Classes 9 & 10: general subjects only
  IF _class IN ('9', '10') THEN
    RETURN _stream_access = 'all';
  END IF;

  -- Classes 11 & 12: stream required
  IF _class IN ('11', '12') THEN
    IF _stream IS NULL THEN
      RETURN FALSE;
    END IF;
    IF _stream = 'pcm' AND _stream_access IN ('shared_science', 'pcm') THEN
      RETURN TRUE;
    END IF;
    IF _stream = 'pcb' AND _stream_access IN ('shared_science', 'pcb') THEN
      RETURN TRUE;
    END IF;
    IF _stream = 'commerce' AND _stream_access = 'commerce' THEN
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_material_storage(_user_id UUID, _path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _parts TEXT[];
  _subject_id UUID;
  _stream_access TEXT;
BEGIN
  IF NOT public.is_approved(_user_id) THEN
    RETURN FALSE;
  END IF;

  _parts := storage.foldername(_path);
  IF array_length(_parts, 1) IS NULL OR array_length(_parts, 1) < 2 THEN
    RETURN FALSE;
  END IF;

  IF _parts[1] <> public.current_class(_user_id)::text THEN
    RETURN FALSE;
  END IF;

  BEGIN
    _subject_id := _parts[2]::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;

  SELECT s.stream_access INTO _stream_access
  FROM public.subjects s
  WHERE s.id = _subject_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  RETURN public.can_access_subject_stream(_user_id, _stream_access);
END;
$$;

-- ===== Signup trigger: persist stream from user metadata =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  _class public.class_level := NULLIF(NEW.raw_user_meta_data->>'class', '')::public.class_level;
  _stream TEXT := NULLIF(LOWER(TRIM(NEW.raw_user_meta_data->>'stream')), '');
BEGIN
  IF _class IN ('9', '10') THEN
    _stream := NULL;
  ELSIF _stream IS NOT NULL AND _stream NOT IN ('pcm', 'pcb', 'commerce') THEN
    _stream := NULL;
  END IF;

  INSERT INTO public.profiles (id, name, email, class, stream, approved)
  VALUES (NEW.id, _name, NEW.email, _class, _stream, false);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END;
$$;

-- ===== RLS: subjects =====
DROP POLICY IF EXISTS "Approved students read own class subjects" ON public.subjects;

CREATE POLICY "Approved students read accessible subjects" ON public.subjects
  FOR SELECT USING (
    public.is_approved(auth.uid())
    AND class = public.current_class(auth.uid())
    AND public.can_access_subject_stream(auth.uid(), stream_access)
  );

-- ===== RLS: materials =====
DROP POLICY IF EXISTS "Approved students read own class materials" ON public.materials;

CREATE POLICY "Approved students read accessible materials" ON public.materials
  FOR SELECT USING (
    public.is_approved(auth.uid())
    AND class = public.current_class(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.subjects s
      WHERE s.id = materials.subject_id
        AND public.can_access_subject_stream(auth.uid(), s.stream_access)
    )
  );

-- ===== Storage: enforce stream via subject in path =====
DROP POLICY IF EXISTS "Approved students read own class files" ON storage.objects;

CREATE POLICY "Approved students read accessible class files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'materials'
    AND public.can_access_material_storage(auth.uid(), name)
  );

-- ===== Lock down new helpers =====
REVOKE ALL ON FUNCTION public.current_stream(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_subject_stream(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_material_storage(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.current_stream(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_subject_stream(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_material_storage(uuid, text) TO authenticated;

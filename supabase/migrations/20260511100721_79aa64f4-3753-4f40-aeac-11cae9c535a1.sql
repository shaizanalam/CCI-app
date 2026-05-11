
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('student', 'admin');
CREATE TYPE public.class_level AS ENUM ('9', '10', '11', '12');
CREATE TYPE public.material_type AS ENUM ('pdf', 'image');

-- ===== Profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  class public.class_level,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== User roles (separate table — security best practice) =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===== Security definer helpers =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT approved FROM public.profiles WHERE id = _user_id), false);
$$;

CREATE OR REPLACE FUNCTION public.current_class(_user_id UUID)
RETURNS public.class_level
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT class FROM public.profiles WHERE id = _user_id;
$$;

-- ===== Updated-at trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Auto create profile + student role on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _name TEXT := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  _class public.class_level := NULLIF(NEW.raw_user_meta_data->>'class', '')::public.class_level;
BEGIN
  INSERT INTO public.profiles (id, name, email, class, approved)
  VALUES (NEW.id, _name, NEW.email, _class, false);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Subjects =====
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class public.class_level NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, class)
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_subjects_class ON public.subjects(class);

-- ===== Materials =====
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class public.class_level NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_type public.material_type NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_materials_subject ON public.materials(subject_id);
CREATE INDEX idx_materials_class ON public.materials(class);
CREATE INDEX idx_materials_created_at ON public.materials(created_at DESC);

-- ===== Notifications =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_class public.class_level,  -- NULL means all classes
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_target_class ON public.notifications(target_class);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ===== RLS policies =====
-- profiles
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile (limited)" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND approved = (SELECT approved FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- subjects: approved students see own class; admins see all
CREATE POLICY "Approved students read own class subjects" ON public.subjects
  FOR SELECT USING (
    public.is_approved(auth.uid()) AND class = public.current_class(auth.uid())
  );
CREATE POLICY "Admins read all subjects" ON public.subjects
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- materials: same isolation
CREATE POLICY "Approved students read own class materials" ON public.materials
  FOR SELECT USING (
    public.is_approved(auth.uid()) AND class = public.current_class(auth.uid())
  );
CREATE POLICY "Admins read all materials" ON public.materials
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage materials" ON public.materials
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- notifications: approved students see own class or global; admins see all
CREATE POLICY "Approved students read own class notifications" ON public.notifications
  FOR SELECT USING (
    public.is_approved(auth.uid())
    AND (target_class IS NULL OR target_class = public.current_class(auth.uid()))
  );
CREATE POLICY "Admins read all notifications" ON public.notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Storage bucket: private materials =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: path layout = "<class>/<subject_id>/<filename>"
CREATE POLICY "Approved students read own class files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'materials'
    AND public.is_approved(auth.uid())
    AND (storage.foldername(name))[1] = public.current_class(auth.uid())::text
  );

CREATE POLICY "Admins read all material files" ON storage.objects
  FOR SELECT USING (bucket_id = 'materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload material files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update material files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete material files" ON storage.objects
  FOR DELETE USING (bucket_id = 'materials' AND public.has_role(auth.uid(), 'admin'));

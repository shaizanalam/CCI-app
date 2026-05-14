-- Allow institute admins to remove student profile rows (e.g. reject / account removal).
-- Auth user records remain in auth.users until cleaned separately; app already used profile delete for reject.

CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

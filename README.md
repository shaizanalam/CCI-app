# Lumen — Coaching Institute Learning Platform

Premium, minimal learning platform for coaching institutes. Class 9–12 students get a private library of subjects, PDFs and notifications scoped strictly to their class. Admins approve students, manage subjects, upload materials, and broadcast alerts.

> **Note on platform:** This is a **responsive web app (PWA-friendly)** built with TanStack Start + React. It was originally requested as a React Native / Expo app, but Lovable builds web apps. The web build runs on phones, installs to the home screen, and ships the same features over the same Lovable Cloud (Supabase) backend.

---

## 1. Tech stack

- **Frontend:** TanStack Start v1, React 19, TypeScript, Tailwind v4 (CSS-only theme), TanStack Query, TanStack Router (file-based)
- **Backend:** Lovable Cloud (Supabase) — PostgreSQL, Auth, Storage, RLS
- **Design:** Soft UI / neumorphism, Poppins (display) + Inter (body), indigo `#4f46e5` on `#e8edf2`
- **Validation:** Zod
- **Build:** Vite 7, deploys to Cloudflare Workers via `@cloudflare/vite-plugin`

## 2. Folder structure

```
src/
├── routes/                       # File-based routes (TanStack Router)
│   ├── __root.tsx                # Shell, providers, head metadata
│   ├── index.tsx                 # Landing page
│   ├── login.tsx, signup.tsx, pending.tsx
│   ├── app.tsx                   # Student layout (auth + approval gate)
│   ├── app.index.tsx             # Home
│   ├── app.subjects.index.tsx    # Subjects list
│   ├── app.subjects.$subjectId.tsx
│   ├── app.notifications.tsx
│   ├── app.profile.tsx
│   ├── admin.tsx                 # Admin layout (role gate)
│   ├── admin.index.tsx           # Dashboard
│   ├── admin.students.tsx
│   ├── admin.subjects.tsx
│   ├── admin.upload.tsx
│   └── admin.notifications.tsx
├── components/
│   ├── neo/         # NeoCard, NeoButton, NeoInput primitives
│   ├── layout/      # BottomNav
│   └── viewer/      # ProtectedViewer + Watermark
├── hooks/
│   └── use-session.ts            # Session + profile + role
├── services/                     # All Supabase access lives here
│   ├── auth.service.ts
│   ├── materials.service.ts
│   ├── notifications.service.ts
│   └── students.service.ts
├── integrations/supabase/        # Auto-generated, do not edit
├── lib/utils.ts
└── styles.css                    # Design tokens, neumorphic shadows
supabase/                         # Lovable-managed migrations + config
```

UI components never call Supabase directly — they go through `services/*`.

## 3. Database

Tables (all in `public`):

| Table          | Purpose |
|----------------|---------|
| `profiles`     | name, email, class (`9`–`12`), `approved` |
| `user_roles`   | `(user_id, role)` — separate from profiles for security |
| `subjects`     | name, class, created_by |
| `materials`    | subject_id, class, title, description, storage_path, file_type (`pdf`/`image`) |
| `notifications`| title, message, target_class (NULL = all classes) |

Helpers (`SECURITY DEFINER`, `search_path=public`):
- `has_role(uid, role)` — role check
- `is_approved(uid)` — approval gate
- `current_class(uid)` — class for RLS filtering

Trigger `on_auth_user_created` auto-creates a `profiles` row + `student` role on signup, with `approved = false`.

## 4. Row-Level Security

- **profiles:** users read/update own row; admins read/update all. The student `UPDATE` policy pins `approved` to its current value, so students cannot self-approve.
- **subjects / materials / notifications:** approved students can read rows where `class = current_class(auth.uid())` (notifications also allow `target_class IS NULL`); admins read & write everything.
- **storage (`materials` bucket, private):** path layout `<class>/<subject_id>/<filename>`. Approved students can `SELECT` only objects whose first folder matches their class. Only admins can `INSERT/UPDATE/DELETE`.

Class isolation is **server-enforced** via RLS, never client-side filtering.

## 5. Authentication flow

1. Student fills signup form → `supabase.auth.signUp` with `name` + `class` in metadata.
2. Trigger creates `profiles` (`approved=false`) + `user_roles('student')`.
3. User lands on `/pending`. Cannot read any content (RLS blocks unapproved users).
4. Admin approves via `/admin/students` → `profiles.approved = true`.
5. Next login (or `Check status` button) routes the student to `/app`.

Auto-confirm email is **on** so admins (not email verification) are the gate. Password leak check (HIBP) is enabled.

To create the **first admin**, sign up as a normal user, then in Lovable Cloud → Database run:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<that-user-id>', 'admin')
ON CONFLICT DO NOTHING;
UPDATE public.profiles SET approved = true WHERE id = '<that-user-id>';
```

## 6. Protected file viewer

- All material files live in the **private** `materials` bucket.
- `getSignedUrl(path, 600)` mints a 10-minute signed URL on demand.
- `ProtectedViewer` renders PDFs in an `<iframe>` with `#toolbar=0&navpanes=0` (best-effort hide of native download/print) and images via `<img>` with `contextmenu` blocked + `draggable={false}`.
- A diagonal `Watermark` overlay shows the logged-in student's email across the document (pointer-events none).
- No download button is exposed in the UI.

These are practical anti-casual-sharing measures, not DRM. Determined screen capture cannot be blocked from a web app — that's true of every web platform.

## 7. Local development

```bash
bun install
cp .env.example .env   # then fill in (see below)
bun run dev
```

Required env vars (see `.env.example`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never commit
```

Inside Lovable these are auto-injected. After exporting to GitHub, supply them in your local `.env` and your hosting provider's secrets.

## 8. Supabase setup (after export)

1. Create a Supabase project.
2. Run migrations: `supabase db push` (or apply the SQL files in `supabase/migrations/` via the dashboard).
3. Confirm the `materials` bucket exists and is **private**.
4. Settings → Auth → enable email/password, turn on **HIBP**, optionally turn off email confirmation (this app's flow uses admin approval as the gate).
5. Copy URL + anon key + service role key into your `.env`.

## 9. Build & deploy

```bash
bun run build      # production build
bun run preview    # preview locally
```

The Vite config targets Cloudflare Workers. Any host that runs a Vite build (Vercel, Netlify, Cloudflare Pages, Workers) works. Set the same env vars on the host.

## 10. Continuing development outside Lovable

- All Lovable-specific files (`src/integrations/supabase/*`, `.env`, `supabase/config.toml`) are standard Supabase / Vite artifacts — they keep working in any IDE.
- Add new Supabase tables via `supabase/migrations/<timestamp>_*.sql`. Always include RLS policies.
- Keep the rule: **components import from `services/*` only — never call `supabase` directly from a route or component.** This keeps the data layer swappable.
- New routes: drop a file in `src/routes/`. The router plugin regenerates `routeTree.gen.ts` automatically — never edit that file by hand.
- Run `supabase gen types typescript` after schema changes to refresh `src/integrations/supabase/types.ts`.

## 11. Security recommendations

- Rotate the service role key periodically.
- Periodically run the Supabase database linter and resolve new findings.
- For higher PDF protection, consider a server-rendered watermarking pipeline (rasterize + reflow PDFs with the user's identity baked in) instead of a CSS overlay.
- Add rate limiting on Auth (Supabase setting) to slow brute force on student passwords.

## 12. Roadmap / future work

- Push notifications (Web Push) for new uploads
- Per-subject pinning and search
- Bulk admin upload (multi-file)
- Soft-delete for materials with admin restore
- Audit log of admin actions
- Server-side PDF watermarking for stronger anti-sharing

## 13. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Student logs in but sees no subjects | `profiles.approved` is still `false`, or no subjects exist for their class |
| "row violates RLS" on insert | Doing it as a non-admin user; only admins can write to `subjects` / `materials` / `notifications` |
| Signed URL returns 400 | Storage path doesn't match `<class>/<subject_id>/<file>` layout, or user's class doesn't match |
| First admin can't log in | You haven't inserted a row in `user_roles` with `role='admin'` for that user (see §5) |

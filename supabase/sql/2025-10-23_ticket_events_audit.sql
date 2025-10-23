-- Ticket Events Audit Migration (idempotente)
-- Esquema: agrega columnas de auditoría y un índice para timeline

begin;

-- Columnas de auditoría
alter table public.ticket_events add column if not exists author_id uuid;
alter table public.ticket_events add column if not exists author_display_name text;
alter table public.ticket_events add column if not exists created_at timestamptz default now();

-- Backfill de created_at para filas antiguas
update public.ticket_events set created_at = coalesce(created_at, now()) where created_at is null;

-- Índice para rendimiento del timeline
create index if not exists ticket_events_ticket_created_idx on public.ticket_events (ticket_id, created_at desc);

commit;

-- RLS mínimas para permitir SELECT/INSERT desde la app
-- Nota: si ya tienes RLS activado con políticas más estrictas, ajusta estas reglas según tu modelo.

-- Activar RLS (si aún no está activado)
alter table public.ticket_events enable row level security;

-- Policy de SELECT para usuarios autenticados (temporal, refinar más adelante)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ticket_events' AND policyname = 'events_select_authenticated'
  ) THEN
    CREATE POLICY events_select_authenticated
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Policy de INSERT: autor debe coincidir con el UID del JWT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ticket_events' AND policyname = 'events_insert_authenticated'
  ) THEN
    CREATE POLICY events_insert_authenticated
    ON public.ticket_events
    FOR INSERT
    TO authenticated
    WITH CHECK (author_id = auth.uid());
  END IF;
END $$;

-- Opcional: puedes añadir más políticas (UPDATE/DELETE) si las necesitas.
-- Verifica siempre desde la app (rol authenticated); en el SQL Editor (rol postgres) las políticas no aplican.
-- RLS estricta para visibilidad de respuestas en ticket_events
-- Objetivo: el cliente ve todas las respuestas de sus tickets; cada técnico ve SOLO sus propias respuestas.

begin;

-- Asegurar RLS activo
alter table public.ticket_events enable row level security;

-- Eliminar policy permisiva si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ticket_events' AND policyname='events_select_authenticated'
  ) THEN
    DROP POLICY events_select_authenticated ON public.ticket_events;
  END IF;
END $$;

-- Policy: Dueño del ticket (Cliente) puede ver TODOS los eventos de sus tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ticket_events' AND policyname='events_select_owner'
  ) THEN
    CREATE POLICY events_select_owner
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.tickets t
        WHERE t.id = ticket_id AND t.created_by = auth.uid()
      )
    );
  END IF;
END $$;

-- Policy: Técnico puede ver SOLO sus propias respuestas (type = 'response')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ticket_events' AND policyname='events_select_tecnico_own_response'
  ) THEN
    CREATE POLICY events_select_tecnico_own_response
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (
      (auth.jwt() ->> 'role') = 'Tecnico' AND author_id = auth.uid() AND type = 'response'
    );
  END IF;
END $$;

-- Policy: Técnico puede ver eventos NO respuesta (asignaciones, cierres, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='ticket_events' AND policyname='events_select_tecnico_non_response'
  ) THEN
    CREATE POLICY events_select_tecnico_non_response
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (
      (auth.jwt() ->> 'role') = 'Tecnico' AND type <> 'response'
    );
  END IF;
END $$;

commit;

-- Nota:
-- - Mantiene INSERT policy existente que exige author_id = auth.uid().
-- - Requiere que el claim JWT 'role' contenga 'Tecnico' para cuentas técnicas.
-- - Si necesitas que técnicos vean todas las respuestas del equipo, crea una policy adicional con condición por organización/equipo.
# Service Desk — Gestión de Tickets de Soporte

Aplicación Full‑Stack para gestionar tickets de soporte (crear, asignar, responder y cerrar) diseñada para demostrar capacidades de arquitectura moderna, seguridad basada en RLS y buenas prácticas de calidad de código. El objetivo del proyecto es mostrar competencias de diseño end‑to‑end con un stack simple, productivo y listo para producción.

## Stack Tecnológico

- Front‑end
  - React + Vite
  - Zod (validación)
  - Hooks y componentes funcionales
- Back‑end (Edge Functions)
  - Supabase Edge Functions (Node/TypeScript) para lógica sensible
  - Autorización por JWT y control de roles
- Base de Datos / BaaS
  - Supabase (PostgreSQL)
  - RLS (Row Level Security) y Policies basadas en JWT
  - Autenticación (Email/Password) y sistema de Roles (Cliente vs. Técnico)
- DevOps / Testing
  - GitHub Actions (CI)
  - Vitest (pruebas unitarias)
  - ESLint + Prettier

## Características Principales

- Creación de tickets con validación robusta (Zod)
- Asignación de tickets a técnicos (manual/automática)
- Respuesta de clientes y técnicos con trazabilidad
- Cierre de tickets con registro de eventos
- Historial cronológico (timeline) por ticket
- Búsqueda y filtros básicos
- Autenticación y control de permisos por rol

## Arquitectura y Decisiones Técnicas Clave

### Por qué React + Supabase
- React + Vite ofrece rapidez de desarrollo, DX simple y rendimiento.
- Supabase aporta PostgreSQL administrado, autenticación y RLS nativas, reduciendo complejidad de backend tradicional.
- El modelo "BaaS + Edge Functions" permite mover la lógica sensible al servidor con baja fricción.

### Seguridad
- RLS en PostgreSQL garantiza que cada consulta esté filtrada por usuario/rol, evitando accesos indebidos incluso si el frontend es manipulado.
- Políticas por rol (Cliente/Técnico) usando claims del JWT: `auth.uid()` y `auth.jwt() ->> 'role'`.
- Lógica crítica (asignar, cerrar, responder) diseñada para ejecutarse en Edge Functions, reduciendo superficie de ataque en el cliente.

Ejemplo de RLS (SELECT de tickets para dueño o técnico):
```sql
create policy tickets_select_owner_or_tecnico
on public.tickets
for select
to authenticated
using (
  created_by = auth.uid() or (auth.jwt() ->> 'role') = 'Tecnico'
);
```

### Auditoría (ticket_events)
- Cada cambio relevante genera un evento con `author_id`, `author_display_name` y `created_at`.
- Estructura simplificada:
```sql
-- Columnas clave
-- ticket_events(id, ticket_id, type, details, author_id, author_display_name, created_at)
```
- Índice por `ticket_id, created_at desc` optimiza la visualización del timeline.

### Edge Functions (diseño)
- `assignTicket`: valida rol Técnico, cambia `assigned_to`, registra evento.
- `closeTicket`: valida rol Técnico, cambia estado a CERRADO, registra evento.
- `addResponse`: valida que el autor sea autenticado y permitido, registra evento respuesta.
- Beneficio: la lógica y validaciones viven fuera del cliente, con permisos verificados en el servidor.

## Guía de Inicio Rápido

1) Clonar e instalar
```bash
git clone <repo-url>
cd ticket
npm install
```

2) Configuración de entorno
- Crear `.env` (o `.env.local`) con:
```
VITE_SUPABASE_URL=https://<YOUR-PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
```

3) Levantar en desarrollo
```bash
npm run dev
```

4) Ejecutar pruebas
```bash
npm run test
```

5) Configurar Base de Datos (Supabase)
- Abrir el SQL Editor de Supabase y ejecutar el script:
  - `supabase/sql/2025-10-23_ticket_events_audit.sql`
- (Opcional) Añadir RLS avanzadas en `public.tickets` para roles Cliente/Técnico según tu modelo.

## Contribución y Licencia

- Contribuciones bienvenidas vía Pull Requests.
- Estilo de código: ESLint/Prettier, pruebas con Vitest.
- Licencia: MIT.

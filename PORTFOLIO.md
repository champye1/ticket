# Gestión de Tickets — React + Supabase

Pequeña aplicación de soporte para crear, buscar, cerrar y reabrir tickets. Orientada a demostrar un flujo CRUD limpio con buen diseño, SEO básico y pruebas de UI.

## Enlace demo

- Live demo: [añade tu URL de despliegue]
- Repositorio: [añade tu URL de GitHub]

## Pitch (30s)

Un gestor de tickets simple y efectivo: creación rápida, búsqueda por texto, estados claros (Abierto/En Progreso/Cerrado) y acciones accesibles. UI en Tailwind con tokens de diseño propios, y datos persistentes en Supabase con actualizaciones optimistas.

## Destacados

- Diseño consistente: tokens en `tailwind.config.js` (color de marca, sombras, radios, tipografías)
- SEO ready: metadatos (title/description + Open Graph/Twitter) y canonical en `index.html`
- Pruebas de UI: Vitest + Testing Library para `TicketForm` y `TicketList`
- React Query: cache, reintentos y updates optimistas
- Código limpio: componentes presentacionales y servicios con mapeo dominio ⇄ BD

## Stack

- React 19 + Vite 7
- Tailwind 4
- Supabase
- TanStack React Query 5
- Vitest + Testing Library

## Funcionalidades

- Crear tickets (título, descripción, prioridad)
- Buscar por título o descripción
- Cambiar estado (Cerrar / Reabrir)
- Eliminar tickets
- Lista responsive con tarjetas accesibles

## Capturas sugeridas

- Formulario (izquierda) + lista de tickets (derecha)
- Tarjeta con estados y acciones
- Vista móvil (una columna)

Guárdalas en `public/cover.png` y configura Open Graph en `index.html`:

```html
<meta property="og:image" content="/cover.png" />
<meta name="twitter:image" content="/cover.png" />
```

## Despliegue

- Vercel (recomendado): build `npm run build`, output `dist`, variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Netlify: igual que arriba, deploy estático a `dist`
- GitHub Pages: añade `base: '/<repo>/'` en `vite.config.ts` antes de publicar

Actualiza `link rel="canonical"` en `index.html` con tu dominio final.

## Cómo integrarlo en tu portafolio

- Título: Gestión de Tickets — React + Supabase
- Resumen: "CRUD de tickets con búsqueda y estados, UI accesible y pruebas de interfaz."
- Tech: React, Vite, Tailwind, Supabase, React Query, Vitest
- Enlaces: Demo + Código
- 3 bullets de valor:
  - Tokens de diseño propios para consistencia visual
  - SEO y canonical listos para producción
  - Pruebas de UI que validan flujos clave

## Scripts útiles

- `npm run dev` — entorno local (`http://localhost:5174`)
- `npm run test` — pruebas de UI
- `npm run build` — build de producción (genera `dist/`)
- `npm run preview` — servidor estático del build

## Notas

- Las credenciales de Supabase se leen de `import.meta.env` (prefijo `VITE_`)
- Si cambias a GitHub Pages, recuerda ajustar `vite.config.ts` para la ruta base
// Constantes centrales para evitar "magic strings" y mantener consistencia.
// Mantiene los valores usados en la BD (español) con claves semánticas (inglés).

export const TICKET_STATUS = {
  OPEN: 'ABIERTO',
  IN_PROGRESS: 'EN_PROGRESO',
  CLOSED: 'CERRADO'
}

export const PRIORITY = {
  HIGH: 'ALTA',
  MEDIUM: 'MEDIA',
  LOW: 'BAJA'
}

// Tabla principal en Supabase.
export const TABLES = {
  TICKETS: 'tickets'
}

// Utilidades de UI (opcional) para badges; mantienen la paleta consistente.
export const PRIORITY_BADGE_CLASS = {
  [PRIORITY.HIGH]: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  [PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  [PRIORITY.LOW]: 'bg-green-100 text-green-800 ring-1 ring-green-200'
}

export const STATUS_BADGE_CLASS = {
  [TICKET_STATUS.OPEN]: 'bg-brand-100 text-brand-800 ring-1 ring-brand-200',
  [TICKET_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  [TICKET_STATUS.CLOSED]: 'bg-green-100 text-green-800 ring-1 ring-green-200'
}
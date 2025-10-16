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
  [PRIORITY.HIGH]: 'bg-red-500 text-white',
  [PRIORITY.MEDIUM]: 'bg-yellow-500 text-white',
  [PRIORITY.LOW]: 'bg-green-500 text-white'
}

export const STATUS_BADGE_CLASS = {
  [TICKET_STATUS.OPEN]: 'bg-blue-500 text-white',
  [TICKET_STATUS.IN_PROGRESS]: 'bg-yellow-500 text-white',
  [TICKET_STATUS.CLOSED]: 'bg-green-500 text-white'
}
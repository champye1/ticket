import { supabase, testConnection } from '../supabaseClient'
import { TABLES, TICKET_STATUS, PRIORITY } from '../constants'
import { AppError, ErrorCodes, fromSupabase } from '../errors'
import { validateCreateTicket, validateUpdateTicketStatus } from '../validation'

/**
 * @typedef {import('../types').Ticket} Ticket
 * @typedef {import('../types').CreateTicketDTO} CreateTicketDTO
 * @typedef {import('../types').PagedResult<Ticket>} PagedTickets
 */

// Mapeos entre esquema de BD (inglés) y modelo de dominio (español)
const STATUS_DB_TO_DOMAIN = {
  open: TICKET_STATUS.OPEN,
  in_progress: TICKET_STATUS.IN_PROGRESS,
  closed: TICKET_STATUS.CLOSED
}

const STATUS_DOMAIN_TO_DB = {
  [TICKET_STATUS.OPEN]: 'open',
  [TICKET_STATUS.IN_PROGRESS]: 'in_progress',
  [TICKET_STATUS.CLOSED]: 'closed'
}

const PRIORITY_DB_TO_DOMAIN = {
  high: PRIORITY.HIGH,
  medium: PRIORITY.MEDIUM,
  low: PRIORITY.LOW
}

const PRIORITY_DOMAIN_TO_DB = {
  [PRIORITY.HIGH]: 'high',
  [PRIORITY.MEDIUM]: 'medium',
  [PRIORITY.LOW]: 'low'
}

/**
 * Convierte una fila de BD al modelo de dominio.
 * @param {any} row
 * @returns {Ticket|null}
 */
export function mapDbToDomain(row) {
  if (!row) return null
  const titulo = row.title ?? row.titulo ?? ''
  const descripcion = row.description ?? row.descripcion ?? ''
  const prioridadRaw = row.priority ?? row.prioridad
  const estadoRaw = row.status ?? row.estado

  const prioridad = PRIORITY_DB_TO_DOMAIN[prioridadRaw] || prioridadRaw
  const estado = STATUS_DB_TO_DOMAIN[estadoRaw] || estadoRaw

  return {
    id: row.id,
    titulo,
    descripcion,
    prioridad,
    estado,
    created_at: row.created_at
  }
}

// Obtiene todos los tickets ordenados por fecha de creación y mapea campos.
export async function getAllTickets() {
  const { data, error } = await supabase
    .from(TABLES.TICKETS)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw fromSupabase(error)
  return (data || []).map(mapDbToDomain)
}

// Paginación básica con count exacto
export async function getTicketsPaged({ page = 1, pageSize = 20 } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from(TABLES.TICKETS)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw fromSupabase(error)
  return { items: (data || []).map(mapDbToDomain), total: count ?? (data?.length || 0) }
}

// Crea un ticket. Espera un objeto con titulo, descripcion, prioridad y (opcional) estado.
export async function createTicket({ titulo, descripcion, prioridad, estado = TICKET_STATUS.OPEN }) {
  const ok = await testConnection()
  if (!ok) throw new AppError(ErrorCodes.DB_CONNECTION, 'No hay conexión con la base de datos')

  // Validación y normalización
  const valid = validateCreateTicket({ titulo, descripcion, prioridad, estado })

  const createdAt = new Date().toISOString()
  const payloadEN = {
    title: valid.titulo,
    description: valid.descripcion,
    status: STATUS_DOMAIN_TO_DB[valid.estado] || 'open',
    priority: PRIORITY_DOMAIN_TO_DB[valid.prioridad] || 'medium',
    created_at: createdAt
  }
  const payloadES = {
    titulo: valid.titulo,
    descripcion: valid.descripcion,
    estado: valid.estado,
    prioridad: valid.prioridad,
    created_at: createdAt
  }

  const first = await supabase.from(TABLES.TICKETS).insert([payloadEN]).select()
  if (!first.error) {
    return mapDbToDomain(first.data?.[0])
  }

  const fallback = await supabase.from(TABLES.TICKETS).insert([payloadES]).select()
  if (fallback.error) throw fromSupabase(fallback.error)
  return mapDbToDomain(fallback.data?.[0])
}

// Actualiza el estado de un ticket.
export async function updateTicketStatus(id, newStatus) {
  const valid = validateUpdateTicketStatus({ id, newStatus })

  const first = await supabase
    .from(TABLES.TICKETS)
    .update({ status: STATUS_DOMAIN_TO_DB[valid.newStatus] || 'open' })
    .eq('id', valid.id)
    .select()

  if (!first.error) {
    return mapDbToDomain(first.data?.[0])
  }

  const fallback = await supabase
    .from(TABLES.TICKETS)
    .update({ estado: valid.newStatus })
    .eq('id', valid.id)
    .select()

  if (fallback.error) throw fromSupabase(fallback.error)
  return mapDbToDomain(fallback.data?.[0])
}

// Elimina un ticket por id.
export async function deleteTicket(id) {
  const { error } = await supabase
    .from(TABLES.TICKETS)
    .delete()
    .eq('id', id)

  if (error) throw fromSupabase(error)
  return true
}
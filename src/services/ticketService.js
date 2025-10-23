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

function ensureDb() {
  if (!supabase) throw new AppError(ErrorCodes.DB_CONNECTION, 'Supabase no configurado. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  return supabase
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
    created_at: row.created_at,
    assigned_to: row.assigned_to ?? row.asignado_a ?? null
  }
}

// Obtiene todos los tickets ordenados por fecha de creación y mapea campos.
export async function getAllTickets() {
  const db = ensureDb()
  const { data, error } = await db
    .from(TABLES.TICKETS)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw fromSupabase(error)
  return (data || []).map(mapDbToDomain)
}

// Paginación básica con count exacto
export async function getTicketsPaged({ page = 1, pageSize = 20 } = {}) {
  const db = ensureDb()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await db
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

  const db = ensureDb()
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

  const first = await db.from(TABLES.TICKETS).insert([payloadEN]).select()
  if (!first.error && Array.isArray(first.data) && first.data.length) {
    const mapped = mapDbToDomain(first.data[0])
    insertTicketEventSafe(mapped.id, 'created', { prioridad: mapped.prioridad, estado: mapped.estado }).catch(() => {})
    return mapped
  }

  const fallback = await db.from(TABLES.TICKETS).insert([payloadES]).select()
  if (fallback.error || !Array.isArray(fallback.data) || !fallback.data.length) throw fromSupabase(fallback.error || new Error('No se pudo crear el ticket'))
  const mapped = mapDbToDomain(fallback.data[0])
  insertTicketEventSafe(mapped.id, 'created', { prioridad: mapped.prioridad, estado: mapped.estado }).catch(() => {})
  return mapped
}

// Actualiza el estado de un ticket.
export async function updateTicketStatus(id, newStatus) {
  const db = ensureDb()
  const valid = validateUpdateTicketStatus({ id, newStatus })
  const normalizedStatus = STATUS_DOMAIN_TO_DB[valid.newStatus] || 'open'

  const first = await db
    .from(TABLES.TICKETS)
    .update({ status: normalizedStatus })
    .eq('id', valid.id)
    .select()

  if (!first.error && Array.isArray(first.data) && first.data.length) {
    const mapped = mapDbToDomain(first.data[0])
    insertTicketEventSafe(mapped.id, 'status_updated', { estado: mapped.estado }).catch(() => {})
    return mapped
  }

  const fallback = await db
    .from(TABLES.TICKETS)
    .update({ estado: valid.newStatus })
    .eq('id', valid.id)
    .select()

  if (fallback.error || !Array.isArray(fallback.data) || !fallback.data.length) throw fromSupabase(fallback.error || new Error('No se pudo actualizar el estado del ticket'))
  const mapped = mapDbToDomain(fallback.data[0])
  insertTicketEventSafe(mapped.id, 'status_updated', { estado: mapped.estado }).catch(() => {})
  return mapped
}

// Elimina un ticket por id.
export async function deleteTicket(id) {
  const db = ensureDb()
  const { error } = await db
    .from(TABLES.TICKETS)
    .delete()
    .eq('id', id)

  if (error) throw fromSupabase(error)
  insertTicketEventSafe(id, 'deleted', {}).catch(() => {})
  return true
}

export async function assignTicket(id, technician) {
  const db = ensureDb()
  // soporta dos posibles columnas: assigned_to (EN) o asignado_a (ES)
  const first = await db
    .from(TABLES.TICKETS)
    .update({ assigned_to: technician })
    .eq('id', id)
    .select()

  if (!first.error && Array.isArray(first.data) && first.data.length) {
    const mapped = mapDbToDomain(first.data[0])
    // Log de evento no bloqueante
    insertTicketEventSafe(mapped.id, 'assigned', { assigned_to: technician }).catch(() => {})
    return mapped
  }

  const fallback = await db
    .from(TABLES.TICKETS)
    .update({ asignado_a: technician })
    .eq('id', id)
    .select()

  if (fallback.error || !Array.isArray(fallback.data) || !fallback.data.length) throw fromSupabase(fallback.error || new Error('No se pudo asignar el ticket'))
  const mapped = mapDbToDomain(fallback.data[0])
  insertTicketEventSafe(mapped.id, 'assigned', { assigned_to: technician }).catch(() => {})
  return mapped
}

async function insertTicketEventSafe(ticketId, type, details = {}, when = new Date().toISOString()) {
  const db = ensureDb()
  try {
    const payloadEN = { ticket_id: ticketId, type, details, created_at: when }
    const res = await db.from('ticket_events').insert([payloadEN])
    if (!res.error) return true
  } catch (_) {}
  try {
    const payloadES = { ticket_id: ticketId, tipo: type, detalle: JSON.stringify(details), created_at: when }
    await db.from('ticket_events').insert([payloadES])
    return true
  } catch (_) {
    return false
  }
}

// Obtiene todos los técnicos desde tablas y fallback
export async function getTechnicians() {
  const db = ensureDb()
  const candidates = [
    { table: 'technicians', fields: ['name', 'full_name', 'nombre', 'email'] },
    { table: 'users', fields: ['name', 'full_name', 'email', 'username'] },
    { table: 'profiles', fields: ['full_name', 'username', 'name', 'email'] },
  ]
  for (const c of candidates) {
    try {
      const { data, error } = await db.from(c.table).select('*').limit(200)
      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          id: row.id ?? row.user_id ?? row.uuid ?? row.uid ?? row.email ?? row.username ?? row.name ?? row.full_name ?? row.nombre ?? String(Math.random()),
          name: row.name ?? row.full_name ?? row.username ?? row.email ?? row.nombre ?? 'Desconocido'
        }))
      }
    } catch (_) {
      // Ignora y prueba siguiente tabla
    }
  }
  // Fallback: deduce técnicos distintos desde tickets existentes
  try {
    const { data } = await db
      .from(TABLES.TICKETS)
      .select('assigned_to, asignado_a')
    const set = new Set()
    for (const r of data || []) {
      const name = r.assigned_to ?? r.asignado_a
      if (name) set.add(name)
    }
    return Array.from(set).map((name, i) => ({ id: `name-${i}`, name }))
  } catch (_) {
    return []
  }
}

// Nuevo: registrar una respuesta del técnico en ticket_events
export async function addTicketResponse(id, message) {
  const ok = await testConnection()
  if (!ok) throw new AppError(ErrorCodes.DB_CONNECTION, 'No hay conexión con la base de datos')
  const when = new Date().toISOString()
  const logged = await insertTicketEventSafe(id, 'response', { message }, when)
  if (!logged) throw new AppError(ErrorCodes.DB_SCHEMA, 'No se pudo registrar la respuesta')
  return { ticket_id: id, type: 'response', message, created_at: when }
}

// Obtener eventos de un ticket para renderizar timeline
export async function getTicketEvents(id) {
  const db = ensureDb()
  const { data, error } = await db
    .from('ticket_events')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  if (error) throw fromSupabase(error)
  return (data || []).map((row) => {
    const type = row.type ?? row.tipo ?? 'unknown'
    let details = row.details ?? row.detalle ?? {}
    if (typeof details === 'string') {
      try { details = JSON.parse(details) } catch (_) {}
    }
    return { type, details, created_at: row.created_at }
  })
}
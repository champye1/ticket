// Capa de servicio: aísla todas las llamadas a Supabase.
// Beneficios: desacopla la UI del origen de datos, facilita pruebas y cambios.

import { supabase, testConnection } from '../supabaseClient'
import { TABLES, TICKET_STATUS, PRIORITY } from '../constants'

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

function mapDbToDomain(row) {
  if (!row) return null
  // Soporta columnas en inglés (title/description/status/priority) y español (titulo/descripcion/estado/prioridad)
  const titulo = row.title ?? row.titulo ?? ''
  const descripcion = row.description ?? row.descripcion ?? ''
  // Cuando vienen en inglés, mapeamos a dominio español; si vienen en español, usamos tal cual
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

  if (error) throw new Error(error.message)
  return (data || []).map(mapDbToDomain)
}

// Crea un ticket. Espera un objeto con titulo, descripcion, prioridad y (opcional) estado.
export async function createTicket({ titulo, descripcion, prioridad, estado = TICKET_STATUS.OPEN }) {
  const ok = await testConnection()
  if (!ok) throw new Error('No hay conexión con la base de datos')

  const payloadEN = {
    title: titulo,
    description: descripcion,
    status: STATUS_DOMAIN_TO_DB[estado] || 'open',
    priority: PRIORITY_DOMAIN_TO_DB[prioridad] || 'medium',
    created_at: new Date().toISOString()
  }

  const payloadES = {
    titulo,
    descripcion,
    estado,
    prioridad,
    created_at: new Date().toISOString()
  }

  // Intento 1: columnas en inglés
  let { data, error } = await supabase
    .from(TABLES.TICKETS)
    .insert([payloadEN])
    .select()

  // Si falla (por columna inexistente), reintentar con columnas en español
  if (error) {
    const fallback = await supabase
      .from(TABLES.TICKETS)
      .insert([payloadES])
      .select()
    if (fallback.error) throw new Error(fallback.error.message)
    return mapDbToDomain(fallback.data?.[0])
  }
  return mapDbToDomain(data?.[0])
}

// Actualiza el estado de un ticket.
export async function updateTicketStatus(id, newStatus) {
  // Intento 1: actualizar columna en inglés
  let { data, error } = await supabase
    .from(TABLES.TICKETS)
    .update({ status: STATUS_DOMAIN_TO_DB[newStatus] || 'open' })
    .eq('id', id)
    .select()

  if (error) {
    // Fallback: columna en español
    const fallback = await supabase
      .from(TABLES.TICKETS)
      .update({ estado: newStatus })
      .eq('id', id)
      .select()
    if (fallback.error) throw new Error(fallback.error.message)
    return mapDbToDomain(fallback.data?.[0])
  }
  return mapDbToDomain(data?.[0])
}

// Elimina un ticket por id.
export async function deleteTicket(id) {
  const { error } = await supabase
    .from(TABLES.TICKETS)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}
// Tipos compartidos para el dominio de Tickets

export type TicketStatus = 'ABIERTO' | 'EN_PROGRESO' | 'CERRADO'
export type TicketPriority = 'ALTA' | 'MEDIA' | 'BAJA'

export interface Ticket {
  id: string
  titulo: string
  descripcion: string
  prioridad: TicketPriority
  estado: TicketStatus
  created_at?: string
}

export interface CreateTicketDTO {
  titulo: string
  descripcion: string
  prioridad: TicketPriority
  estado?: TicketStatus
}

export interface UpdateTicketStatusDTO {
  id: string
  newStatus: TicketStatus
}

export interface PagedResult<T> {
  items: T[]
  total: number
}
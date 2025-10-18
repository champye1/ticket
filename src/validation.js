import { z } from 'zod'
import { AppError, ErrorCodes } from './errors'
import { TICKET_STATUS, PRIORITY } from './constants'

const STATUS_VALUES = Object.values(TICKET_STATUS)
const PRIORITY_VALUES = Object.values(PRIORITY)

// Schema para creación de tickets
export const CreateTicketSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(120, 'El título no debe exceder 120 caracteres'),
  descripcion: z.string().trim().min(3, 'La descripción debe tener al menos 3 caracteres').max(500, 'La descripción no debe exceder 500 caracteres'),
  prioridad: z.enum(PRIORITY_VALUES, {
    errorMap: () => ({ message: 'Prioridad inválida' }),
  }),
  estado: z.enum(STATUS_VALUES, {
    errorMap: () => ({ message: 'Estado inválido' }),
  }).optional().default('ABIERTO'),
})

// Schema para actualización de estado
export const UpdateTicketStatusSchema = z.object({
  id: z.coerce.string().min(1, 'ID inválido'), // Acepta number y lo convierte a string
  newStatus: z.enum(STATUS_VALUES, {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
})

export function validateCreateTicket(dto) {
  const result = CreateTicketSchema.safeParse(dto)
  if (!result.success) {
    const first = (result.error.errors || result.error.issues || [])[0]
    const message = first?.message || 'Datos inválidos'
    const normalizedCause = { errors: result.error.errors || result.error.issues || [] }
    throw new AppError(ErrorCodes.VALIDATION, message, normalizedCause)
  }
  return result.data
}

export function validateUpdateTicketStatus(dto) {
  const result = UpdateTicketStatusSchema.safeParse(dto)
  if (!result.success) {
    const first = (result.error.errors || result.error.issues || [])[0]
    const message = first?.message || 'Datos inválidos'
    const normalizedCause = { errors: result.error.errors || result.error.issues || [] }
    throw new AppError(ErrorCodes.VALIDATION, message, normalizedCause)
  }
  return result.data
}
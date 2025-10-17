export const ErrorCodes = {
  DB_CONNECTION: 'DB_CONNECTION',
  DB_SCHEMA: 'DB_SCHEMA',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN'
}

export class AppError extends Error {
  constructor(code, message, cause) {
    super(message)
    this.name = 'AppError'
    this.code = code || ErrorCodes.UNKNOWN
    this.cause = cause
  }
}

export function fromSupabase(error) {
  if (!error) return new AppError(ErrorCodes.UNKNOWN, 'Error desconocido')
  const msg = (error.message || String(error)).toLowerCase()
  if (msg.includes('could not find') || msg.includes('schema')) {
    return new AppError(ErrorCodes.DB_SCHEMA, 'Esquema de tabla inválido o columnas no encontradas', error)
  }
  if (msg.includes('fetch') || msg.includes('network')) {
    return new AppError(ErrorCodes.NETWORK, 'Error de red', error)
  }
  return new AppError(ErrorCodes.UNKNOWN, error.message || String(error), error)
}
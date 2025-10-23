import { useMemo } from 'react'
import { TICKET_STATUS, PRIORITY } from '../constants'

// Calcula métricas simples para el dashboard de tickets.
// No realiza llamadas de red; opera sobre la lista ya cargada/filtrada.
export function useMetrics(tickets = []) {
  return useMemo(() => {
    const total = tickets.length

    const openCount = tickets.filter(t => t.estado === TICKET_STATUS.OPEN).length
    const inProgressCount = tickets.filter(t => t.estado === TICKET_STATUS.IN_PROGRESS).length
    const closedCount = tickets.filter(t => t.estado === TICKET_STATUS.CLOSED).length
    const activeCount = openCount + inProgressCount

    const byPriority = tickets.reduce((acc, t) => {
      const p = t.prioridad || 'DESCONOCIDA'
      acc[p] = (acc[p] || 0) + 1
      return acc
    }, {})

    // Promedio de horas de resolución para tickets con created_at y closed_at
    const durations = tickets
      .filter(t => t.estado === TICKET_STATUS.CLOSED && t.closed_at && t.created_at)
      .map(t => (new Date(t.closed_at) - new Date(t.created_at)) / 36e5)
    const avgResolutionHours = durations.length
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
      : null

    return {
      total,
      activeCount,
      openCount,
      inProgressCount,
      closedCount,
      byPriority: {
        [PRIORITY.HIGH]: byPriority[PRIORITY.HIGH] || 0,
        [PRIORITY.MEDIUM]: byPriority[PRIORITY.MEDIUM] || 0,
        [PRIORITY.LOW]: byPriority[PRIORITY.LOW] || 0
      },
      avgResolutionHours
    }
  }, [tickets])
}
import React from 'react'
import { PRIORITY_BADGE_CLASS, STATUS_BADGE_CLASS, TICKET_STATUS, PRIORITY } from '../constants'

export default function MetricsBar({ metrics, lastSyncedAt }) {
  if (!metrics) return null

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const d = new Date(dateString)
    return d.toLocaleString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
            <div className="text-xs text-gray-500">Tickets totales</div>
            <div className="text-xl font-semibold text-gray-800">{metrics.total}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
            <div className="text-xs text-gray-500">Activos</div>
            <div className="text-xl font-semibold text-gray-800">{metrics.activeCount}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
            <div className="text-xs text-gray-500">Cerrados</div>
            <div className="text-xl font-semibold text-gray-800">{metrics.closedCount}</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
            <div className="text-xs text-gray-500">Promedio resolución</div>
            <div className="text-xl font-semibold text-gray-800">{metrics.avgResolutionHours != null ? `${metrics.avgResolutionHours} h` : '—'}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">Última sincronización: <span className="font-medium text-gray-700">{formatDate(lastSyncedAt)}</span></div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
          <div className="text-xs font-semibold text-gray-700 mb-2">Por prioridad</div>
          <div className="flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_BADGE_CLASS[PRIORITY.HIGH]}`}>Alta: {metrics.byPriority[PRIORITY.HIGH]}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_BADGE_CLASS[PRIORITY.MEDIUM]}`}>Media: {metrics.byPriority[PRIORITY.MEDIUM]}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_BADGE_CLASS[PRIORITY.LOW]}`}>Baja: {metrics.byPriority[PRIORITY.LOW]}</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-soft">
          <div className="text-xs font-semibold text-gray-700 mb-2">Por estado</div>
          <div className="flex gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASS[TICKET_STATUS.OPEN]}`}>Abiertos: {metrics.openCount}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASS[TICKET_STATUS.IN_PROGRESS]}`}>En progreso: {metrics.inProgressCount}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_CLASS[TICKET_STATUS.CLOSED]}`}>Cerrados: {metrics.closedCount}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
// Tarjeta individual de ticket: muestra información y acciones.
// No contiene lógica de datos: delega acciones via props.

import React from 'react'
import { PRIORITY_BADGE_CLASS, STATUS_BADGE_CLASS } from '../constants'

const TicketCard = ({ ticket, onUpdateStatus, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const isTemp = String(ticket.id).startsWith('temp-')

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden transition hover:shadow-card">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 text-base sm:text-lg font-semibold text-gray-800 leading-tight break-words">
            {ticket.titulo}
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-soft ${PRIORITY_BADGE_CLASS[ticket.prioridad] || 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'}`}>
            {ticket.prioridad}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">{formatDate(ticket.created_at)}</div>
      </div>

      <div className="p-5">
        <div className="mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-soft ${STATUS_BADGE_CLASS[ticket.estado] || 'bg-gray-500 text-white'}`}>
            {ticket.estado}
          </span>
        </div>
        <p className="text-gray-700 text-sm sm:text-base mb-3 whitespace-pre-line">{ticket.descripcion}</p>
        <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
          {ticket.estado !== 'CERRADO' ? (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'CERRADO')}
              disabled={isTemp}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 shadow-soft transition"
            >
              Cerrar Ticket
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'ABIERTO')}
              disabled={isTemp}
              className="flex-1 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-soft transition"
            >
              Reabrir
            </button>
          )}
          <button
            onClick={() => onDelete(ticket.id)}
            disabled={isTemp}
            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 shadow-soft transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketCard
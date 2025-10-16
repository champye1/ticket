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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg transform hover:-translate-y-1">
      <div className="p-4 border-b relative">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 pr-20 line-clamp-1">
            {ticket.titulo}
          </h3>
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_BADGE_CLASS[ticket.prioridad] || 'bg-gray-500 text-white'}`}>
            {ticket.prioridad}
          </span>
        </div>
        <div className="text-xs text-gray-500">{formatDate(ticket.created_at)}</div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[ticket.estado] || 'bg-gray-500 text-white'}`}>
            {ticket.estado}
          </span>
        </div>
        <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem]">{ticket.descripcion}</p>
        <div className="flex justify-between gap-2 pt-2 border-t">
          {ticket.estado !== 'CERRADO' ? (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'CERRADO')}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
            >
              Cerrar Ticket
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'ABIERTO')}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
            >
              Reabrir
            </button>
          )}
          <button
            onClick={() => onDelete(ticket.id)}
            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketCard
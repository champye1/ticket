// Lista de tickets presentacional: se centra en renderizado y delega acciones.
// Clean Code: sin llamadas a servicios ni estado propio (salvo props).

import React from 'react'
import TicketCard from './TicketCard'

// Props esperadas:
// - tickets: array de tickets en modelo de dominio (español)
// - loading: bool para indicar carga
// - onUpdateStatus: fn(id, nuevoEstado) para actualizar estado
// - onDelete: fn(id) para eliminar ticket
const TicketList = ({ tickets = [], loading = false, onUpdateStatus, onDelete }) => {
  if (loading) {
    return <div className="text-center py-10 text-gray-500">Cargando tickets…</div>
  }

  if (!tickets.length) {
    return <div className="text-center py-10 text-gray-500">No hay tickets disponibles.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8">
      {tickets.map((t) => (
        <TicketCard
          key={t.id}
          ticket={t}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TicketList
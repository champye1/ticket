import React from 'react'
import TicketCard from './TicketCard'

export default function TicketList({ tickets, onUpdateStatus, onDelete, onAssign, onRespond, technicians = [], canAssign = false }) {
  if (!tickets?.length) return <div className="empty">No hay tickets</div>
  return (
    <div className="ticket-list">
      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} onUpdateStatus={onUpdateStatus} onDelete={onDelete} onAssign={onAssign} onRespond={onRespond} technicians={technicians} canAssign={canAssign} />
      ))}
    </div>
  )
}
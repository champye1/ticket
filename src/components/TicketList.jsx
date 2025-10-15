import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

const TicketList = ({ tickets, onTicketUpdated, onRefresh }) => {
  const [editingTicket, setEditingTicket] = useState(null)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return '⚠️'
      case 'in_progress':
        return '⏰'
      case 'closed':
        return '✅'
      default:
        return '❓'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'in_progress':
        return 'En Progreso'
      case 'closed':
        return 'Cerrado'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return { backgroundColor: '#fee2e2', color: '#991b1b' }
      case 'in_progress':
        return { backgroundColor: '#fef3c7', color: '#92400e' }
      case 'closed':
        return { backgroundColor: '#dcfce7', color: '#166534' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { backgroundColor: '#fee2e2', color: '#991b1b' }
      case 'medium':
        return { backgroundColor: '#fef3c7', color: '#92400e' }
      case 'low':
        return { backgroundColor: '#dcfce7', color: '#166534' }
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' }
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Media'
      case 'low':
        return 'Baja'
      default:
        return priority
    }
  }

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)
        .select()

      if (error) {
        console.error('Error al actualizar ticket:', error)
        return
      }

      if (data && data[0]) {
        onTicketUpdated(data[0])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId)

      if (error) {
        console.error('Error al eliminar ticket:', error)
        return
      }

      onRefresh()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (tickets.length === 0) {
    return (
      <div style={{padding: '32px', textAlign: 'center'}}>
        <div style={{fontSize: '48px', marginBottom: '16px'}}>📋</div>
        <h3 style={{fontSize: '18px', fontWeight: '500', color: '#111827', marginBottom: '8px'}}>
          No hay tickets
        </h3>
        <p style={{color: '#6b7280'}}>
          Crea tu primer ticket para comenzar
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{padding: '24px', borderBottom: '1px solid #e5e7eb'}}>
        <h2 style={{fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0'}}>
          Lista de Tickets ({tickets.length})
        </h2>
      </div>

      <div>
        {tickets.map((ticket) => (
          <div key={ticket.id} style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}>
              <div style={{flex: 1}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px'}}>
                  <span style={{fontSize: '20px'}}>{getStatusIcon(ticket.status)}</span>
                  <h3 style={{fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0'}}>
                    {ticket.title}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    ...getStatusColor(ticket.status)
                  }}>
                    {getStatusText(ticket.status)}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '500',
                    ...getPriorityColor(ticket.priority)
                  }}>
                    {getPriorityText(ticket.priority)}
                  </span>
                </div>

                <p style={{color: '#6b7280', marginBottom: '12px'}}>
                  {ticket.description}
                </p>

                <div style={{display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280'}}>
                  <span>
                    <strong>Cliente:</strong> {ticket.customer_name}
                  </span>
                  <span>
                    <strong>Email:</strong> {ticket.customer_email}
                  </span>
                  <span>
                    <strong>Creado:</strong> {formatDate(ticket.created_at)}
                  </span>
                </div>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px'}}>
                {ticket.status !== 'closed' && (
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                    style={{
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '4px 8px'
                    }}
                  >
                    <option value="open">Abierto</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="closed">Cerrado</option>
                  </select>
                )}

                <button
                  onClick={() => setEditingTicket(ticket)}
                  style={{
                    padding: '8px',
                    color: '#9ca3af',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                  title="Editar ticket"
                >
                  ✏️
                </button>

                <button
                  onClick={() => deleteTicket(ticket.id)}
                  style={{
                    padding: '8px',
                    color: '#9ca3af',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                  title="Eliminar ticket"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TicketList
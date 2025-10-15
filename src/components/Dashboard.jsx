import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import TicketList from './TicketList'
import TicketForm from './TicketForm'

const Dashboard = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0
  })

  // Cargar tickets al montar el componente
  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al cargar tickets:', error)
        return
      }

      setTickets(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ticketsData) => {
    const stats = {
      total: ticketsData.length,
      open: ticketsData.filter(t => t.status === 'open').length,
      inProgress: ticketsData.filter(t => t.status === 'in_progress').length,
      closed: ticketsData.filter(t => t.status === 'closed').length
    }
    setStats(stats)
  }

  const handleTicketCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev])
    calculateStats([newTicket, ...tickets])
    setShowForm(false)
  }

  const handleTicketUpdated = (updatedTicket) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    )
    calculateStats(tickets.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    ))
  }

  if (loading) {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
        <div className="text-lg">Cargando tickets...</div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb', padding: '24px'}}>
      <div style={{maxWidth: '1280px', margin: '0 auto'}}>
        {/* Header */}
        <div style={{marginBottom: '32px'}}>
          <h1 style={{fontSize: '30px', fontWeight: '700', color: '#111827', marginBottom: '8px'}}>
            Sistema de Tickets de Soporte
          </h1>
          <p style={{color: '#6b7280'}}>
            Gestiona y da seguimiento a las solicitudes de soporte
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px'}}>
          <div className="card">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{width: '32px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px'}}>
                📋
              </div>
              <div>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0'}}>Total</p>
                <p style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0'}}>{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{width: '32px', height: '32px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px'}}>
                ⚠️
              </div>
              <div>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0'}}>Abiertos</p>
                <p style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0'}}>{stats.open}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{width: '32px', height: '32px', backgroundColor: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px'}}>
                ⏰
              </div>
              <div>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0'}}>En Progreso</p>
                <p style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0'}}>{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{width: '32px', height: '32px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px'}}>
                ✅
              </div>
              <div>
                <p style={{fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0'}}>Cerrados</p>
                <p style={{fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0'}}>{stats.closed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{marginBottom: '24px'}}>
          <button
            onClick={() => setShowForm(true)}
            className="btn"
            style={{display: 'flex', alignItems: 'center', gap: '8px'}}
          >
            ➕ Nuevo Ticket
          </button>
        </div>

        {/* Ticket Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '672px',
              margin: '0 16px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <TicketForm 
                onTicketCreated={handleTicketCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* Ticket List */}
        <div className="card">
          <TicketList 
            tickets={tickets}
            onTicketUpdated={handleTicketUpdated}
            onRefresh={fetchTickets}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
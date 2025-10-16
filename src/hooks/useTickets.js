// Hook personalizado: centraliza el estado y reglas de negocio de tickets.
// Evita prop drilling y organiza toda la interacción con la capa de servicio.

import { useEffect, useMemo, useState } from 'react'
import { TICKET_STATUS } from '../constants'
import { getAllTickets, createTicket, updateTicketStatus, deleteTicket } from '../services/ticketService'

export function useTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar al montar
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Consultar todos los tickets
  async function refresh() {
    setLoading(true)
    try {
      const data = await getAllTickets()
      setTickets(data)
    } catch (err) {
      console.error('Error al cargar tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo ticket
  async function addTicket({ titulo, descripcion, prioridad }) {
    setLoading(true)
    try {
      const created = await createTicket({ titulo, descripcion, prioridad, estado: TICKET_STATUS.OPEN })
      if (created) setTickets(prev => [created, ...prev])
    } catch (err) {
      console.error('Error al crear ticket:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado
  async function setTicketStatus(id, newStatus) {
    try {
      const updated = await updateTicketStatus(id, newStatus)
      if (updated) {
        setTickets(prev => prev.map(t => (t.id === id ? updated : t)))
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err)
    }
  }

  // Eliminar
  async function removeTicket(id) {
    try {
      await deleteTicket(id)
      setTickets(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error('Error al eliminar:', err)
    }
  }

  // Filtro de búsqueda (case-insensitive en título y descripción)
  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return tickets
    return tickets.filter(t =>
      (t.titulo || '').toLowerCase().includes(term) ||
      (t.descripcion || '').toLowerCase().includes(term)
    )
  }, [tickets, searchTerm])

  return {
    tickets,
    filteredTickets,
    loading,
    searchTerm,
    setSearchTerm,
    refresh,
    addTicket,
    setTicketStatus,
    removeTicket
  }
}
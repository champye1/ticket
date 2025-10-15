import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTicket, setNewTicket] = useState({
    titulo: '',
    descripcion: '',
    estado: 'open',
    prioridad: 'medium'
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
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    
    if (!newTicket.titulo || !newTicket.descripcion) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            titulo: newTicket.titulo,
            descripcion: newTicket.descripcion,
            estado: newTicket.estado,
            prioridad: newTicket.prioridad,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Error al crear ticket:', error)
        alert('Error al crear ticket')
        return
      }

      // Actualizar la lista de tickets
      setTickets(prevTickets => [data[0], ...prevTickets])
      
      // Limpiar el formulario
      setNewTicket({
        titulo: '',
        descripcion: '',
        estado: 'open',
        prioridad: 'medium'
      })
      
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear ticket')
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'in_progress': return 'En Progreso'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Sistema de Tickets de Soporte</h1>
      
      {/* Formulario para crear tickets */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Crear Nuevo Ticket</h2>
        <form onSubmit={handleCreateTicket}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
              Título
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="titulo"
              type="text"
              name="titulo"
              value={newTicket.titulo}
              onChange={handleInputChange}
              placeholder="Título del ticket"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">
              Descripción
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="descripcion"
              name="descripcion"
              value={newTicket.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción detallada del problema"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estado">
                Estado
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="estado"
                name="estado"
                value={newTicket.estado}
                onChange={handleInputChange}
              >
                <option value="open">Abierto</option>
                <option value="in_progress">En Progreso</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prioridad">
                Prioridad
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="prioridad"
                name="prioridad"
                value={newTicket.prioridad}
                onChange={handleInputChange}
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Crear Ticket
            </button>
          </div>
        </form>
      </div>

      {/* Lista de tickets */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Tickets ({tickets.length})</h2>
        
        {loading ? (
          <div className="text-center p-4">Cargando tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-100 p-4 text-center rounded">
            No hay tickets disponibles.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white shadow-md rounded p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg mb-2">{ticket.titulo}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      ticket.estado === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.estado === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getStatusText(ticket.estado)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ticket.prioridad === 'high' ? 'bg-red-100 text-red-800' :
                      ticket.prioridad === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getPriorityText(ticket.prioridad)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{ticket.descripcion}</p>
                <div className="mt-4 text-xs text-gray-500">
                  {new Date(ticket.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
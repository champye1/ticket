import React, { useState, useEffect } from 'react'
import { supabase, testConnection } from './supabaseClient'

function App() {
  // Estados para manejar tickets y formulario
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTicket, setNewTicket] = useState({
    titulo: '',
    descripcion: '',
    estado: 'ABIERTO',
    prioridad: 'MEDIA'
  })

  // Cargar tickets al montar el componente
  useEffect(() => {
    fetchTickets()
  }, [])

  /**
   * Obtiene todos los tickets de Supabase
   */
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

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Crea un nuevo ticket en Supabase
   */
  const handleCreateTicket = async (e) => {
    e.preventDefault()
    
    if (!newTicket.titulo || !newTicket.descripcion) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true) // Mostrar indicador de carga

    try {
      // Verificar conexión a Supabase antes de intentar crear el ticket
      const isConnected = await testConnection()
      if (!isConnected) {
        alert('Error de conexión con la base de datos. Por favor, intenta más tarde.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            titulo: newTicket.titulo,
            descripcion: newTicket.descripcion,
            estado: newTicket.estado || 'ABIERTO',
            prioridad: newTicket.prioridad || 'MEDIA',
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Error al crear ticket:', error)
        let errorMessage = 'Error al crear ticket'
        
        // Mensajes de error más específicos según el tipo de error
        if (error.code === '23505') {
          errorMessage = 'Ya existe un ticket con este título'
        } else if (error.code === '23502') {
          errorMessage = 'Faltan campos requeridos'
        } else if (error.code === '42P01') {
          errorMessage = 'La tabla de tickets no existe'
        } else if (error.code === '42501') {
          errorMessage = 'No tienes permisos para crear tickets'
        } else if (error.code === '23503') {
          errorMessage = 'El ticket hace referencia a un registro que no existe'
        }
        
        alert(errorMessage)
        setLoading(false)
        return
      }

      // Limpiar el formulario y actualizar la lista de tickets
      setNewTicket({
        titulo: '',
        descripcion: '',
        estado: 'ABIERTO',
        prioridad: 'MEDIA'
      })
      
      // Si se creó correctamente, actualizar la lista de tickets
      if (data && data.length > 0) {
        setTickets(prevTickets => [data[0], ...prevTickets])
      } else {
        // Si no hay datos en la respuesta, recargar todos los tickets
        fetchTickets()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear el ticket')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualiza el estado de un ticket en Supabase
   */
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ estado: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error al actualizar ticket:', error)
        alert('Error al actualizar el estado del ticket')
        return
      }

      // Actualizar el estado local
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === id ? { ...ticket, estado: newStatus } : ticket
        )
      )
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el estado del ticket')
    }
  }

  /**
   * Elimina un ticket de Supabase
   */
  const handleDeleteTicket = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error al eliminar ticket:', error)
        alert('Error al eliminar el ticket')
        return
      }

      // Actualizar el estado local
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== id))
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el ticket')
    }
  }

  /**
   * Formatea la fecha para mostrarla en un formato legible
   */
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  /**
   * Devuelve la clase CSS para el badge de prioridad
   */
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'ALTA':
        return 'bg-red-500 text-white'
      case 'MEDIA':
        return 'bg-yellow-500 text-white'
      case 'BAJA':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  /**
   * Devuelve la clase CSS para el badge de estado
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ABIERTO':
        return 'bg-blue-500 text-white'
      case 'EN_PROGRESO':
        return 'bg-yellow-500 text-white'
      case 'CERRADO':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Hero estilo Freshdesk */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-gray-100 border border-gray-200 shadow-sm mb-10 sm:mb-12">
          <div className="px-6 sm:px-10 py-12 sm:py-16 text-center">
            <span className="inline-block mb-4 sm:mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-white border border-gray-200 text-gray-700 shadow-sm">
              SISTEMA DE TICKETS
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              Agiliza la atención al cliente con un sistema de tickets
            </h1>
            <p className="mt-4 sm:mt-6 text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
              Impresiona a tus clientes con una gestión de incidencias clara y moderna. Crea, actualiza y cierra tickets en segundos.
            </p>
            <div className="mt-8 sm:mt-10">
              <a href="#nuevo-ticket" className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors">
                Crear ticket gratis
              </a>
            </div>
          </div>
        </section>
        
        {/* Formulario para crear tickets */}
        <div id="nuevo-ticket" className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8 sm:mb-10 transition-all hover:shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-700 border-b pb-2">
            Crear Nuevo Ticket
          </h2>
          <form onSubmit={handleCreateTicket} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="titulo">
                Título
              </label>
              <input
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="titulo"
                type="text"
                name="titulo"
                value={newTicket.titulo}
                onChange={handleInputChange}
                placeholder="Título del ticket"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="descripcion"
                name="descripcion"
                value={newTicket.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción detallada del problema"
                rows="3"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="prioridad">
                Prioridad
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="prioridad"
                name="prioridad"
                value={newTicket.prioridad}
                onChange={handleInputChange}
              >
                <option value="BAJA">BAJA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="ALTA">ALTA</option>
              </select>
            </div>
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105 shadow-md"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Lista de tickets */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-700 border-b pb-2 flex items-center justify-between">
            <span>Tickets Activos</span>
            <button 
              onClick={fetchTickets} 
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-md transition-all"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {!loading && tickets.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500 text-lg">No hay tickets disponibles.</p>
              <p className="text-gray-400 mt-2">Crea un nuevo ticket para comenzar.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg transform hover:-translate-y-1">
                {/* Header de la tarjeta */}
                <div className="p-4 border-b relative">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 pr-20 line-clamp-1">
                      {ticket.titulo}
                    </h3>
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
                
                {/* Cuerpo de la tarjeta */}
                <div className="p-4">
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.estado)}`}>
                      {ticket.estado}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem]">
                    {ticket.descripcion}
                  </p>
                  
                  {/* Botones de acción */}
                  <div className="flex justify-between gap-2 pt-2 border-t">
                    {ticket.estado !== 'CERRADO' ? (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'CERRADO')}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                      >
                        Cerrar Ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'ABIERTO')}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                      >
                        Reabrir
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Sistema de Tickets de Soporte © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

export default App
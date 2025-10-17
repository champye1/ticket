// App ahora es un orquestador liviano: compone UI y usa el hook.
import React from 'react'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import TicketForm from './components/TicketForm'
import TicketList from './components/TicketList'
import { useTickets } from './hooks/useTickets'
import { TICKET_STATUS } from './constants'

function App() {
  // Obtiene estado y operaciones desde el hook
  const {
    filteredTickets,
    loading,
    searchTerm,
    setSearchTerm,
    refresh,
    addTicket,
    setTicketStatus,
    removeTicket,
    error,
    clearError
  } = useTickets()

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Header onCreateClick={() => document.getElementById('nuevo-ticket')?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Búsqueda y formulario */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <button onClick={refresh} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-md transition-all" disabled={loading}>
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-md border border-red-300 bg-red-50 p-3">
              <div className="text-sm text-red-700">
                {error.message || 'Ocurrió un error. Intenta de nuevo.'}
              </div>
              <button onClick={clearError} className="text-xs text-red-700 hover:underline">Cerrar</button>
            </div>
          )}

          <div id="nuevo-ticket" className="mt-6">
            <TicketForm onCreate={addTicket} loading={loading} error={error} />
          </div>
        </div>

        {/* Lista de tickets */}
        <TicketList 
          tickets={filteredTickets}
          loading={loading}
          onUpdateStatus={(id, status) => setTicketStatus(id, status)}
          onDelete={removeTicket}
        />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Sistema de Tickets de Soporte © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

export default App
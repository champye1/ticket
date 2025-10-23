import React from 'react'
import { useTickets } from './hooks/useTickets'
import { useMetrics } from './hooks/useMetrics'
import TicketList from './components/TicketList'
import TicketForm from './components/TicketForm'
import MetricsBar from './components/MetricsBar'

export default function App() {
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
    fieldErrors,
    clearError,
    lastSyncedAt
  } = useTickets()

  const metrics = useMetrics(filteredTickets)

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Tickets</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Buscar por título o descripción"
          />
          <button onClick={refresh} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Actualizar</button>
        </div>
      </header>

      <MetricsBar metrics={metrics} lastSyncedAt={lastSyncedAt} />

      {/* Aviso de error general para operaciones (update/delete) */}
      {error && error.code !== 'VALIDATION' && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-red-800">
          <span className="text-sm">{error.message || 'Ha ocurrido un error realizando la operación.'}</span>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <TicketForm
            onCreate={addTicket}
            loading={loading}
            error={error}
            fieldErrors={fieldErrors}
            onDismissError={clearError}
          />
        </div>
        <div className="md:col-span-2">
          <TicketList
            tickets={filteredTickets}
            loading={loading}
            onUpdateStatus={setTicketStatus}
            onDelete={removeTicket}
          />
        </div>
      </section>
    </div>
  )
}
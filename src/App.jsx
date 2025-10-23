import React from 'react'
import useTickets from './hooks/useTickets'
import TicketList from './components/TicketList'
import FiltersBar from './components/FiltersBar'
import useAuth from './hooks/useAuth'
import LoginPanel from './components/LoginPanel'
import TicketForm from './components/TicketForm'
import CreateAccount from './components/CreateAccount'

export default function App() {
  const {
    tickets,
    loading,
    error,
    fieldErrors,
    clearError,
    addTicket,
    addTicketResponse,
    setTicketStatus,
    removeTicket,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    techFilter,
    setTechFilter,
    assignToTechnician,
    technicians,
  } = useTickets()
  const { isTecnico, isCliente, isAuthenticated } = useAuth()
  const [route, setRoute] = React.useState(window.location.hash || '')
  React.useEffect(() => {
    const handler = () => setRoute(window.location.hash || '')
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (route === '#/crear-cuenta') {
    return (
      <div className="app">
        <h1>Service Desk</h1>
        <CreateAccount onGoBack={() => { window.location.hash = '' }} />
      </div>
    )
  }

  return (
    <div className="app">
      <h1>Service Desk</h1>
      {/* Login por rol */}
      <LoginPanel />

      {/* Formulario de creación solo para CLIENTE */}
      {isCliente && isAuthenticated && (
        <div className="mb-6">
          <TicketForm
            onCreate={addTicket}
            loading={loading}
            error={error}
            fieldErrors={fieldErrors}
            onDismissError={clearError}
          />
        </div>
      )}

      {/* Filtros y lista */}
      <FiltersBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        techFilter={techFilter}
        setTechFilter={setTechFilter}
      />
      <TicketList
        tickets={tickets}
        loading={loading}
        onUpdateStatus={setTicketStatus}
        onDelete={removeTicket}
        onAssign={assignToTechnician}
        onRespond={addTicketResponse}
        technicians={technicians}
        canAssign={isTecnico && isAuthenticated}
      />
    </div>
  )
}
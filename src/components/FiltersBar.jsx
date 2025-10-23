import React from 'react'
import { TICKET_STATUS, PRIORITY } from '../constants'

export default function FiltersBar({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  techFilter,
  setTechFilter,
  onClear,
}) {
  return (
    <section className="mb-4 sm:mb-6">
      {/* chips rápidos removidos por solicitud del usuario */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Estado: Todos</option>
          <option value={TICKET_STATUS.OPEN}>Abiertos</option>
          <option value={TICKET_STATUS.IN_PROGRESS}>En progreso</option>
          <option value={TICKET_STATUS.CLOSED}>Cerrados</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Prioridad: Todas</option>
          <option value={PRIORITY.HIGH}>Alta</option>
          <option value={PRIORITY.MEDIUM}>Media</option>
          <option value={PRIORITY.LOW}>Baja</option>
        </select>

        <input
          type="text"
          placeholder="Técnico asignado"
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <button
          type="button"
          onClick={() => {
            setStatusFilter('')
            setPriorityFilter('')
            setTechFilter('')
            if (onClear) onClear()
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  )
}
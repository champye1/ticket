// Tarjeta individual de ticket: muestra información y acciones.
// No contiene lógica de datos: delega acciones via props.

import React, { useState } from 'react'
import { PRIORITY_BADGE_CLASS, STATUS_BADGE_CLASS } from '../constants'
import useAuth from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getTicketEvents } from '../services/ticketService'

const TicketCard = ({ ticket, onUpdateStatus, onDelete, onAssign, onRespond, technicians = [], canAssign = false }) => {
  const [techInput, setTechInput] = useState(ticket.assigned_to || '')
  const [responseText, setResponseText] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [lastResponderShort, setLastResponderShort] = useState('')
  const [lastResponseAt, setLastResponseAt] = useState(null)
  const { user, isAuthenticated, isTecnico } = useAuth()
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // Helper para obtener nombre visible del usuario
  const getUserDisplayName = (u) => {
    if (!u) return ''
    const meta = u.user_metadata || {}
    const name = meta.full_name || meta.name || meta.username || ''
    if (name) return String(name)
    const email = String(u.email || '')
    return email.includes('@') ? email.split('@')[0] : email
  }
  const isTemp = String(ticket.id).startsWith('temp-')

  const eventsQuery = useQuery({
    queryKey: ['ticket_events', ticket.id],
    queryFn: () => getTicketEvents(ticket.id),
    staleTime: 30_000,
    enabled: !!ticket?.id && !isTemp,
  })
  const events = eventsQuery.data || []

  const renderEvent = (ev) => {
    const d = ev?.details || {}
    if (ev.type === 'created') return `Creado (estado: ${d.estado || '—'}, prioridad: ${d.prioridad || '—'})`
    if (ev.type === 'assigned') return `Asignado a: ${d.assigned_to || d.asignado_a || '—'}`
    if (ev.type === 'response') return `Respuesta: ${d.message || ''}`
    if (ev.type === 'status_updated') return `Estado: ${d.estado || ''}`
    return ev.type
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden transition hover:shadow-card">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex-1 text-base sm:text-lg font-semibold text-gray-800 leading-tight break-words">
            {ticket.titulo}
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-soft ${PRIORITY_BADGE_CLASS[ticket.prioridad] || 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'}`}>
            {ticket.prioridad}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">{formatDate(ticket.created_at)}</div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-soft ${STATUS_BADGE_CLASS[ticket.estado] || 'bg-gray-500 text-white'}`}>
            {ticket.estado}
          </span>
          <span className="text-xs text-gray-600">{ticket.assigned_to ? `Asignado a: ${ticket.assigned_to}` : 'Sin técnico'}</span>
        </div>
        <p className="text-gray-700 text-sm sm:text-base mb-3 whitespace-pre-line">{ticket.descripcion}</p>

        {events.length > 0 && (
          <div className="mb-3 border-t border-gray-100 pt-3">
            <div className="text-xs font-semibold text-gray-700 mb-1">Historial</div>
            <ul className="space-y-1 text-xs text-gray-600">
              {events.map((ev, i) => (
                <li key={i}>
                  {new Date(ev.created_at).toLocaleString('es-ES')} · {renderEvent(ev)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {canAssign && (
          <div className="flex items-center gap-2 mb-3">
            <input
              list="tech-options"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Selecciona o escribe técnico"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <datalist id="tech-options">
              <option value="" />
              {technicians.map((t) => (
                <option key={t.id} value={t.name} />
              ))}
            </datalist>
            <button
              onClick={async () => {
                const chosen = techInput.trim() || getUserDisplayName(user)
                if (!chosen) return
                try {
                  await onAssign?.(ticket.id, chosen)
                  setTechInput(chosen)
                } catch (_) {}
              }}
              disabled={isTemp}
              className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-soft transition"
            >
              Asignar
            </button>
          </div>
        )}

        {canAssign && typeof onRespond === 'function' && isAuthenticated && (
          <div className="mb-4">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              onKeyDown={async (e) => {
                 const msg = responseText.trim()
                 if (e.ctrlKey && e.key === 'Enter') {
                   e.preventDefault()
                   if (!msg) return
                   try {
                     await onRespond(ticket.id, msg)
                     // Autoasignar solo si es técnico
                     const displayName = getUserDisplayName(user)
                     if (isTecnico && typeof onAssign === 'function' && displayName) {
                       await onAssign(ticket.id, displayName)
                     }
                     setLastResponse(msg)
                     setLastResponderShort('')
                     setLastResponseAt(new Date().toISOString())
                     setResponseText('')
                   } catch (_) {}
                 } else if (e.altKey && e.key === 'Enter') {
                   e.preventDefault()
                   try {
                     if (msg) {
                       await onRespond(ticket.id, msg)
                       // Autoasignar solo si es técnico
                       const displayName = getUserDisplayName(user)
                       if (isTecnico && typeof onAssign === 'function' && displayName) {
                         await onAssign(ticket.id, displayName)
                       }
                       setLastResponse(msg)
                       setLastResponderShort(String(getUserDisplayName(user) || '').slice(0, 4))
                       setLastResponseAt(new Date().toISOString())
                       setResponseText('')
                     }
                     // Cerrar solo si el usuario tiene permisos (canAssign)
                     if (canAssign && typeof onUpdateStatus === 'function') {
                       await onUpdateStatus(ticket.id, 'CERRADO')
                     }
                   } catch (_) {}
                 } else if (e.key === 'Escape') {
                   setResponseText('')
                 }
               }}
              placeholder="Escribe la respuesta del técnico..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  const msg = responseText.trim()
                  if (!msg) return
                  try {
                    await onRespond(ticket.id, msg)
                    // Autoasignar solo si es técnico
                    const displayName = getUserDisplayName(user)
                    if (isTecnico && typeof onAssign === 'function' && displayName) {
                      await onAssign(ticket.id, displayName)
                    }
                    setLastResponse(msg)
                    setResponseText('')
                    setLastResponderShort('')
                    setLastResponseAt(new Date().toISOString())
                  } catch (_) {}
                }}
                disabled={isTemp || !responseText.trim()}
                className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 shadow-soft transition"
              >
                Responder
              </button>
              {canAssign && typeof onUpdateStatus === 'function' && ticket.estado !== 'CERRADO' && (
                <button
                  onClick={async () => {
                    const msg = responseText.trim()
                    try {
                      if (msg) {
                        await onRespond(ticket.id, msg)
                        // Autoasignar solo si es técnico
                        const displayName = getUserDisplayName(user)
                        if (isTecnico && typeof onAssign === 'function' && displayName) {
                          await onAssign(ticket.id, displayName)
                        }
                        setLastResponse(msg)
                        setResponseText('')
                        const initials = String(getUserDisplayName(user) || '').slice(0, 4)
                        setLastResponderShort(initials)
                        setLastResponseAt(new Date().toISOString())
                      }
                      await onUpdateStatus(ticket.id, 'CERRADO')
                    } catch (_) {}
                  }}
                  disabled={isTemp}
                  className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shadow-soft transition"
                >
                  Responder y Cerrar
                </button>
              )}
            </div>
            {(lastResponse || lastResponderShort) && (
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                {lastResponse && (
                  <div>Última respuesta enviada: {lastResponse}</div>
                )}
                {lastResponderShort && (
                  <div>
                    Respondido por: <span className="font-semibold">{lastResponderShort}</span>
                    {lastResponseAt && (
                      <span> · {new Date(lastResponseAt).toLocaleString('es-ES')}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
          {canAssign && typeof onUpdateStatus === 'function' && ticket.estado !== 'CERRADO' ? (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'CERRADO')}
              disabled={isTemp}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 shadow-soft transition"
            >
              Cerrar Ticket
            </button>
          ) : canAssign && typeof onUpdateStatus === 'function' ? (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'ABIERTO')}
              disabled={isTemp}
              className="flex-1 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 shadow-soft transition"
            >
              Reabrir
            </button>
          ) : (
            <span className="flex-1 text-xs text-gray-500 px-3 py-2">Acciones de estado no disponibles</span>
          )}
          {canAssign && typeof onDelete === 'function' ? (
            <button
              onClick={() => onDelete(ticket.id)}
              disabled={isTemp}
              className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 shadow-soft transition"
            >
              Eliminar
            </button>
          ) : (
            <span className="px-3 py-2 text-xs text-gray-500">Eliminar no disponible</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketCard
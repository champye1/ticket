// Hook personalizado: centraliza el estado y reglas de negocio de tickets.
// Ahora usa React Query para caché, reintentos e updates optimistas.

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTicketsPaged, createTicket, updateTicketStatus, deleteTicket, assignTicket, getTechnicians, addTicketResponse as addTicketResponseService } from '../services/ticketService'
import { AppError, ErrorCodes } from '../errors'
import { TICKET_STATUS } from '../constants'

const FILTERS_KEY = 'filters_v1'

export default function useTickets() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}').search) || '' } catch (_) { return '' }
  })
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState(null)
  const [page] = useState(1)
  const [pageSize] = useState(20)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)
  const [statusFilter, setStatusFilter] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}').status) || '' } catch (_) { return '' }
  })
  const [priorityFilter, setPriorityFilter] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}').priority) || '' } catch (_) { return '' }
  })
  const [techFilter, setTechFilter] = useState(() => {
    try { return (JSON.parse(localStorage.getItem(FILTERS_KEY) || '{}').tech) || '' } catch (_) { return '' }
  })

  const {
    data: pageData,
    error: queryError,
    isLoading: isQueryLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['tickets', page, pageSize],
    queryFn: () => getTicketsPaged({ page, pageSize }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: () => {
      setLastSyncedAt(new Date().toISOString())
    }
  })

  const techniciansQuery = useQuery({
    queryKey: ['technicians'],
    queryFn: getTechnicians,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (queryError) setError(queryError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryError])

  const tickets = pageData?.items || []

  useEffect(() => {
    try {
      const payload = { search: searchTerm, status: statusFilter, priority: priorityFilter, tech: techFilter }
      localStorage.setItem(FILTERS_KEY, JSON.stringify(payload))
    } catch (_) {}
  }, [searchTerm, statusFilter, priorityFilter, techFilter])

  const filteredTickets = useMemo(() => {
    let list = tickets
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(t =>
        (t.titulo || '').toLowerCase().includes(term) ||
        (t.descripcion || '').toLowerCase().includes(term)
      )
    }
    if (statusFilter) list = list.filter(t => t.estado === statusFilter)
    if (priorityFilter) list = list.filter(t => t.prioridad === priorityFilter)
    if (techFilter) {
      if (techFilter === '__UNASSIGNED__') list = list.filter(t => !t.assigned_to)
      else list = list.filter(t => (t.assigned_to || '') === techFilter)
    }
    return list
  }, [tickets, searchTerm, statusFilter, priorityFilter, techFilter])

  // Crear nuevo ticket con update optimista
  const addMutation = useMutation({
    mutationFn: ({ titulo, descripcion, prioridad }) =>
      createTicket({ titulo, descripcion, prioridad, estado: TICKET_STATUS.OPEN }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tickets', page, pageSize] })
      const previous = queryClient.getQueryData(['tickets', page, pageSize])
      const optimistic = {
        id: `temp-${Date.now()}`,
        titulo: variables.titulo,
        descripcion: variables.descripcion,
        prioridad: variables.prioridad,
        estado: TICKET_STATUS.OPEN,
        created_at: new Date().toISOString()
      }
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: [optimistic, ...(old?.items || [])],
        total: (old?.total || 0) + 1
      }))
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tickets', page, pageSize], ctx.previous)
      setError(err)
      // Extraer errores por campo si provienen de zod
      if (err?.code === 'VALIDATION' && err?.cause?.errors?.length) {
        const map = {}
        for (const issue of err.cause.errors) {
          const field = issue.path?.[0]
          if (field) map[field] = issue.message
        }
        setFieldErrors(map)
      } else {
        setFieldErrors(null)
      }
    },
    onSuccess: (created) => {
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: [created, ...((old?.items || []).filter(t => !String(t.id).startsWith('temp-')))],
        total: old?.total ?? 0
      }))
    },
    onSettled: () => {
      // Sin auto-refetch; el usuario decide con "Actualizar"
    }
  })

  // Actualizar estado con update optimista
  const updateMutation = useMutation({
    mutationFn: ({ id, newStatus }) => {
      if (String(id).startsWith('temp-')) {
        const err = new AppError(ErrorCodes.DB_SCHEMA, 'Operación no permitida sobre id temporal. Actualiza la lista para sincronizar.')
        setError(err)
        return Promise.reject(err)
      }
      return updateTicketStatus(id, newStatus)
    },
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets', page, pageSize] })
      const previous = queryClient.getQueryData(['tickets', page, pageSize])
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).map(t => (String(t.id) === String(id) ? { ...t, estado: newStatus } : t)),
        total: old?.total ?? 0
      }))
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tickets', page, pageSize], ctx.previous)
      setError(err)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).map(t => (String(t.id) === String(updated.id) ? updated : t)),
        total: old?.total ?? 0
      }))
    },
    onSettled: () => {
      // Sin auto-refetch; el usuario decide con "Actualizar"
    }
  })

  // Eliminar con update optimista
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTicket(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tickets', page, pageSize] })
      const previous = queryClient.getQueryData(['tickets', page, pageSize])
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).filter(t => String(t.id) !== String(id)),
        total: Math.max((old?.total || 1) - 1, 0)
      }))
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tickets', page, pageSize], ctx.previous)
      setError(err)
    },
    onSettled: () => {
      // Sin auto-refetch; el usuario decide con "Actualizar"
    }
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, technician }) => {
      if (String(id).startsWith('temp-')) {
        const err = new AppError(ErrorCodes.DB_SCHEMA, 'No puedes asignar un ticket con id temporal. Actualiza primero.')
        setError(err)
        return Promise.reject(err)
      }
      return assignTicket(id, technician)
    },
    onMutate: async ({ id, technician }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets', page, pageSize] })
      const previous = queryClient.getQueryData(['tickets', page, pageSize])
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).map(t => String(t.id) === String(id) ? { ...t, assigned_to: technician } : t),
        total: old?.total ?? 0
      }))
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tickets', page, pageSize], ctx.previous)
      setError(err)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).map(t => String(t.id) === String(updated.id) ? updated : t),
        total: old?.total ?? 0
      }))
    },
    onSettled: () => {}
  })

  // Responder ticket: registra evento, sin modificar lista
  const respondMutation = useMutation({
    mutationFn: ({ id, message }) => {
      if (String(id).startsWith('temp-')) {
        const err = new AppError(ErrorCodes.DB_SCHEMA, 'No puedes responder a un ticket temporal.')
        setError(err)
        return Promise.reject(err)
      }
      return addTicketResponseService(id, message)
    },
    onError: (err) => {
      setError(err)
    },
    onSuccess: () => {},
    onSettled: () => {}
  })

  function assignToTechnician(id, technician) {
    setError(null)
    return assignMutation.mutateAsync({ id, technician })
  }

  function refresh() {
    setError(null)
    setFieldErrors(null)
    return refetch().then(() => setLastSyncedAt(new Date().toISOString()))
  }
  function addTicket({ titulo, descripcion, prioridad }) {
    setError(null)
    setFieldErrors(null)
    return addMutation.mutateAsync({ titulo, descripcion, prioridad })
  }
  function setTicketStatus(id, newStatus) {
    setError(null)
    if (String(id).startsWith('temp-')) {
      setError(new AppError(ErrorCodes.UNKNOWN, 'Este ticket aún se está creando. Pulsa “Actualizar” y vuelve a intentar cuando tenga un ID real.'))
      return Promise.reject(new Error('Ticket temporal'))
    }
    return updateMutation.mutateAsync({ id, newStatus })
  }
  function removeTicket(id) {
    setError(null)
    if (String(id).startsWith('temp-')) {
      // Ya se quita localmente; evitar llamar al backend con id inválido
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).filter(t => String(t.id) !== String(id)),
        total: Math.max((old?.total || 1) - 1, 0)
      }))
      return Promise.resolve(true)
    }
    return deleteMutation.mutateAsync(id)
  }
  function addTicketResponse(id, message) {
    setError(null)
    if (String(id).startsWith('temp-')) {
      const err = new AppError(ErrorCodes.UNKNOWN, 'Este ticket aún se está creando. Pulsa “Actualizar” y vuelve a intentar cuando tenga un ID real.')
      setError(err)
      return Promise.reject(err)
    }
    return respondMutation.mutateAsync({ id, message })
  }
  function clearError() {
    setError(null)
    setFieldErrors(null)
  }

  const loading = isQueryLoading || isFetching || addMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading || assignMutation.isLoading || techniciansQuery.isLoading || respondMutation.isLoading

  return {
    tickets: filteredTickets,
    loading,
    error,
    fieldErrors,
    clearError,
    addTicket,
    addTicketResponse,
    setTicketStatus,
    removeTicket,
    refresh,
    search: searchTerm,
    setSearch: setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    techFilter,
    setTechFilter,
    assignToTechnician,
    technicians: techniciansQuery.data || [],
  }
}
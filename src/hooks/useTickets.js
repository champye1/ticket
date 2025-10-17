// Hook personalizado: centraliza el estado y reglas de negocio de tickets.
// Ahora usa React Query para caché, reintentos e updates optimistas.

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TICKET_STATUS } from '../constants'
import { getTicketsPaged, createTicket, updateTicketStatus, deleteTicket } from '../services/ticketService'

export function useTickets() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState(null)
  const [page] = useState(1)
  const [pageSize] = useState(20)

  const {
    data: pageData,
    error: queryError,
    isLoading: isQueryLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['tickets', page, pageSize],
    queryFn: () => getTicketsPaged({ page, pageSize }),
    staleTime: 30_000
  })

  useEffect(() => {
    if (queryError) setError(queryError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryError])

  const tickets = pageData?.items || []

  const filteredTickets = useMemo(() => {
    if (!searchTerm) return tickets
    const term = searchTerm.toLowerCase()
    return tickets.filter(t =>
      (t.titulo || '').toLowerCase().includes(term) ||
      (t.descripcion || '').toLowerCase().includes(term)
    )
  }, [tickets, searchTerm])

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
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })

  // Actualizar estado con update optimista
  const updateMutation = useMutation({
    mutationFn: ({ id, newStatus }) => updateTicketStatus(id, newStatus),
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets', page, pageSize] })
      const previous = queryClient.getQueryData(['tickets', page, pageSize])
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).map(t => (t.id === id ? { ...t, estado: newStatus } : t)),
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
        items: (old?.items || []).map(t => (t.id === updated.id ? updated : t)),
        total: old?.total ?? 0
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })

  // Eliminar con update optimista
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTicket(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tickets', page, pageSize] })
      const previous = queryClient.getQueryData(['tickets', page, pageSize])
      queryClient.setQueryData(['tickets', page, pageSize], (old) => ({
        items: (old?.items || []).filter(t => t.id !== id),
        total: Math.max((old?.total || 1) - 1, 0)
      }))
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['tickets', page, pageSize], ctx.previous)
      setError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    }
  })

  function refresh() {
    setError(null)
    setFieldErrors(null)
    return refetch()
  }
  function addTicket({ titulo, descripcion, prioridad }) {
    setError(null)
    setFieldErrors(null)
    return addMutation.mutateAsync({ titulo, descripcion, prioridad })
  }
  function setTicketStatus(id, newStatus) {
    setError(null)
    return updateMutation.mutateAsync({ id, newStatus })
  }
  function removeTicket(id) {
    setError(null)
    return deleteMutation.mutateAsync(id)
  }
  function clearError() {
    setError(null)
    setFieldErrors(null)
  }

  const loading = isQueryLoading || isFetching || addMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading

  return {
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
    clearError
  }
}
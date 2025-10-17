import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock del cliente de Supabase
let callCount = 0

vi.mock('../../supabaseClient', () => {
  const builder: any = {
    select: vi.fn().mockImplementation((_sel?: any, _opts?: any) => builder),
    order: vi.fn().mockImplementation((_c: string, _o: any) => builder),
    range: vi.fn().mockImplementation((_from: number, _to: number) => {
      return Promise.resolve({
        data: [
          { id: '1', title: 'Uno', description: 'Desc', priority: 'medium', status: 'open', created_at: '2025-01-01' },
          { id: '2', titulo: 'Dos', descripcion: 'Desc2', prioridad: 'ALTA', estado: 'ABIERTO', created_at: '2025-01-02' }
        ],
        error: null,
        count: 2
      })
    }),
    insert: vi.fn().mockImplementation((_rows: any[]) => ({
      select: vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ error: { message: 'schema error' } })
        }
        return Promise.resolve({
          data: [ { id: 'x', titulo: 'Titulo válido', descripcion: 'Descripcion válida', prioridad: 'MEDIA', estado: 'ABIERTO', created_at: '2025-01-03' } ],
          error: null
        })
      })
    })),
    update: vi.fn().mockImplementation((_values: any) => ({
      eq: vi.fn().mockImplementation((_col: string, _id: string) => ({
        select: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({ error: { message: 'schema error' } })
          }
          return Promise.resolve({
            data: [ { id: '1', titulo: 'Uno', descripcion: 'Desc', prioridad: 'MEDIA', estado: 'CERRADO', created_at: '2025-01-01' } ],
            error: null
          })
        })
      }))
    })),
    delete: vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation((_col: string, _id: string) => Promise.resolve({ error: null }))
    }))
  }
  return {
    supabase: { from: vi.fn().mockImplementation((_table: string) => builder) },
    testConnection: vi.fn().mockResolvedValue(true)
  }
})

import { getTicketsPaged, createTicket, updateTicketStatus, deleteTicket, mapDbToDomain } from '../ticketService'

beforeEach(() => {
  callCount = 0
})

describe('ticketService', () => {
  it('mapDbToDomain mapea columnas EN y ES', () => {
    const en = { id: '1', title: 'A', description: 'B', priority: 'high', status: 'closed', created_at: '2025-01-01' }
    const es = { id: '2', titulo: 'C', descripcion: 'D', prioridad: 'MEDIA', estado: 'EN_PROGRESO', created_at: '2025-01-02' }
    const mappedEn = mapDbToDomain(en)!
    const mappedEs = mapDbToDomain(es)!
    expect(mappedEn.titulo).toBe('A')
    expect(mappedEn.prioridad).toBe('ALTA')
    expect(mappedEn.estado).toBe('CERRADO')
    expect(mappedEs.titulo).toBe('C')
    expect(mappedEs.prioridad).toBe('MEDIA')
    expect(mappedEs.estado).toBe('EN_PROGRESO')
  })

  it('getTicketsPaged devuelve items y total', async () => {
    const res = await getTicketsPaged({ page: 1, pageSize: 10 })
    expect(res.total).toBe(2)
    expect(res.items.length).toBe(2)
    expect(res.items[0].titulo).toBeDefined()
  })

  it('createTicket hace fallback al esquema ES cuando el EN falla', async () => {
    const created = await createTicket({ titulo: 'Titulo válido', descripcion: 'Descripcion válida', prioridad: 'MEDIA', estado: 'ABIERTO' })
    expect(created.titulo).toBe('Titulo válido')
    expect(created.estado).toBe('ABIERTO')
  })

  it('updateTicketStatus hace fallback al campo estado', async () => {
    const updated = await updateTicketStatus('1', 'CERRADO')
    expect(updated.estado).toBe('CERRADO')
  })

  it('deleteTicket retorna true cuando no hay error', async () => {
    const ok = await deleteTicket('1')
    expect(ok).toBe(true)
  })

  it('createTicket invalido lanza VALIDATION con errores de campos', async () => {
    await expect(createTicket({ titulo: 'T', descripcion: 'D', prioridad: 'MEDIA', estado: 'ABIERTO' }))
      .rejects.toMatchObject({
        code: 'VALIDATION',
        cause: {
          errors: expect.arrayContaining([
            expect.objectContaining({ path: expect.arrayContaining(['titulo']) }),
            expect.objectContaining({ path: expect.arrayContaining(['descripcion']) })
          ])
        }
      })
  })
})
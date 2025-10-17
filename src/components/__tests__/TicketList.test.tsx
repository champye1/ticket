import React from 'react'
import { render, screen } from '@testing-library/react'
import TicketList from '../TicketList'
import { vi } from 'vitest'

const sampleTickets = [
  {
    id: 1,
    titulo: 'Bug login',
    descripcion: 'No permite acceso con credenciales válidas',
    prioridad: 'MEDIA',
    estado: 'ABIERTO',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    titulo: 'UI glitch en dashboard',
    descripcion: 'El gráfico no se renderiza correctamente',
    prioridad: 'ALTA',
    estado: 'EN_PROGRESO',
    created_at: new Date().toISOString(),
  },
]

describe('TicketList', () => {
  test('muestra estado de carga', () => {
    render(<TicketList tickets={[]} loading={true} onUpdateStatus={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/Cargando tickets/i)).toBeInTheDocument()
  })

  test('muestra estado vacío', () => {
    render(<TicketList tickets={[]} loading={false} onUpdateStatus={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/No hay tickets disponibles/i)).toBeInTheDocument()
  })

  test('renderiza tarjetas para cada ticket', () => {
    render(<TicketList tickets={sampleTickets as any} loading={false} onUpdateStatus={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Bug login')).toBeInTheDocument()
    expect(screen.getByText('UI glitch en dashboard')).toBeInTheDocument()
  })
})
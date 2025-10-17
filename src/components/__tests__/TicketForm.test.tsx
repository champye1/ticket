import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TicketForm from '../TicketForm'
import { vi } from 'vitest'

describe('TicketForm', () => {
  test('muestra errores de validación por campo desde error prop', async () => {
    const error = {
      code: 'VALIDATION',
      cause: {
        errors: [
          { path: ['titulo'], message: 'Título demasiado corto' },
          { path: ['descripcion'], message: 'Descripción demasiado corta' },
        ],
      },
    }

    render(
      <TicketForm
        onCreate={vi.fn()}
        loading={false}
        error={error as any}
        fieldErrors={null}
        onDismissError={vi.fn()}
      />
    )

    expect(await screen.findByText('Título demasiado corto')).toBeInTheDocument()
    expect(await screen.findByText('Descripción demasiado corta')).toBeInTheDocument()
  })

  test('envía valores válidos y llama a onCreate', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue({})

    render(
      <TicketForm
        onCreate={onCreate}
        loading={false}
        error={null}
        fieldErrors={null}
        onDismissError={vi.fn()}
      />
    )

    await user.type(screen.getByPlaceholderText('Ej: Error en login'), 'Bug al iniciar sesión')
    await user.type(screen.getByPlaceholderText('Describe el problema...'), 'La app falla al loguear')
    await user.selectOptions(screen.getByRole('combobox'), 'ALTA')

    await user.click(screen.getByRole('button', { name: /crear ticket/i }))

    expect(onCreate).toHaveBeenCalledWith({
      titulo: 'Bug al iniciar sesión',
      descripcion: 'La app falla al loguear',
      prioridad: 'ALTA',
    })
  })
})
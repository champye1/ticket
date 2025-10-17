import React, { useState } from 'react'
import { PRIORITY } from '../constants'

// Componente: TicketForm
// Responsabilidad única: recoger datos para crear un ticket.
// Clean Code:
// - Sin lógica de datos (ni llamadas a Supabase): delega en onCreate.
// - Controlado (estado local mínimo y validaciones claras).
// - Estilos con utilidades Tailwind para mantener consistencia.
const TicketForm = ({ onCreate, loading, error }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: PRIORITY.MEDIUM
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido'
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es requerida'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    await onCreate(formData)
    setFormData({ titulo: '', descripcion: '', prioridad: PRIORITY.MEDIUM })
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-700 border-b pb-2">Crear Nuevo Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="titulo">Título</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={formData.titulo}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Título del ticket"
          />
          {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Descripción detallada del problema"
          />
          {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="prioridad">Prioridad</label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value={PRIORITY.LOW}>BAJA</option>
            <option value={PRIORITY.MEDIUM}>MEDIA</option>
            <option value={PRIORITY.HIGH}>ALTA</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {loading ? 'Creando…' : 'Crear Ticket'}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error.message || 'No se pudo crear el ticket.'}
          </p>
        )}
      </form>
    </div>
  )
}

export default TicketForm
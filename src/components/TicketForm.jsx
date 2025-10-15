import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

const TicketForm = ({ onTicketCreated, onCancel, editingTicket = null }) => {
  const [formData, setFormData] = useState({
    title: editingTicket?.title || '',
    description: editingTicket?.description || '',
    customer_name: editingTicket?.customer_name || '',
    customer_email: editingTicket?.customer_email || '',
    priority: editingTicket?.priority || 'medium',
    status: editingTicket?.status || 'open'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre del cliente es requerido'
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'El email del cliente es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'El email no es válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (editingTicket) {
        // Actualizar ticket existente
        const { data, error } = await supabase
          .from('tickets')
          .update(formData)
          .eq('id', editingTicket.id)
          .select()

        if (error) {
          console.error('Error al actualizar ticket:', error)
          return
        }

        if (data && data[0]) {
          onTicketCreated(data[0])
        }
      } else {
        // Crear nuevo ticket
        const { data, error } = await supabase
          .from('tickets')
          .insert([formData])
          .select()

        if (error) {
          console.error('Error al crear ticket:', error)
          return
        }

        if (data && data[0]) {
          onTicketCreated(data[0])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px'}}>
        <h2 style={{fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0'}}>
          {editingTicket ? 'Editar Ticket' : 'Nuevo Ticket'}
        </h2>
        <button
          onClick={onCancel}
          style={{
            padding: '8px',
            color: '#9ca3af',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.target.style.color = '#6b7280'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div className="form-group">
          <label htmlFor="title" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
            Título del Ticket *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-group input"
            style={{
              borderColor: errors.title ? '#ef4444' : '#d1d5db'
            }}
            placeholder="Describe brevemente el problema"
          />
          {errors.title && (
            <p style={{marginTop: '4px', fontSize: '14px', color: '#dc2626'}}>{errors.title}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
            Descripción *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="form-group textarea"
            style={{
              borderColor: errors.description ? '#ef4444' : '#d1d5db'
            }}
            placeholder="Proporciona detalles sobre el problema o solicitud"
          />
          {errors.description && (
            <p style={{marginTop: '4px', fontSize: '14px', color: '#dc2626'}}>{errors.description}</p>
          )}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px'}}>
          <div className="form-group">
            <label htmlFor="customer_name" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
              Nombre del Cliente *
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className="form-group input"
              style={{
                borderColor: errors.customer_name ? '#ef4444' : '#d1d5db'
              }}
              placeholder="Nombre completo del cliente"
            />
            {errors.customer_name && (
              <p style={{marginTop: '4px', fontSize: '14px', color: '#dc2626'}}>{errors.customer_name}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="customer_email" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
              Email del Cliente *
            </label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              className="form-group input"
              style={{
                borderColor: errors.customer_email ? '#ef4444' : '#d1d5db'
              }}
              placeholder="email@ejemplo.com"
            />
            {errors.customer_email && (
              <p style={{marginTop: '4px', fontSize: '14px', color: '#dc2626'}}>{errors.customer_email}</p>
            )}
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px'}}>
          <div className="form-group">
            <label htmlFor="priority" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-group select"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {editingTicket && (
            <div className="form-group">
              <label htmlFor="status" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-group select"
              >
                <option value="open">Abierto</option>
                <option value="in_progress">En Progreso</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
          )}
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px'}}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              color: '#374151',
              backgroundColor: '#e5e7eb',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#d1d5db'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Guardando...' : (editingTicket ? 'Actualizar' : 'Crear Ticket')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TicketForm
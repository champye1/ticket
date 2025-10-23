import React, { useEffect, useState } from 'react'

export default function TicketForm({ onCreate, loading, error, fieldErrors, onDismissError }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState('MEDIA')

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setErrors({})
  }, [loading])

  useEffect(() => {
    if (!error) return
    if (error?.code === 'VALIDATION' && error?.cause?.errors?.length) {
      const map = {}
      for (const issue of error.cause.errors) {
        const field = issue.path?.[0]
        if (field) map[field] = issue.message
      }
      setErrors(prev => ({ ...prev, ...map }))
    }
  }, [error])

  useEffect(() => {
    if (!fieldErrors) return
    setErrors(prev => ({ ...prev, ...fieldErrors }))
  }, [fieldErrors])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    const tl = titulo.trim().length
    const dl = descripcion.trim().length
    if (tl < 3 || dl < 10) return
    try {
      await onCreate({ titulo, descripcion, prioridad })
      setTitulo('')
      setDescripcion('')
      setPrioridad('MEDIA')
    } catch (err) {
      // No dejar promesas sin capturar; UI usa error/fieldErrors para mostrarlo
    }
  }

  const tituloLen = titulo.trim().length
  const descripcionLen = descripcion.trim().length
  const isTituloValid = tituloLen >= 3
  const isDescripcionValid = descripcionLen >= 10
  const canSubmit = !loading && isTituloValid && isDescripcionValid
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-white">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Ej: Error en login"
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.titulo && (
            <p className="text-xs text-red-600">{errors.titulo}</p>
          )}
          <span className={`text-[11px] ${isTituloValid ? 'text-gray-500' : 'text-red-600'}`}>{tituloLen}/100</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          placeholder="Describe el problema..."
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.descripcion && (
            <p className="text-xs text-red-600">{errors.descripcion}</p>
          )}
          <span className={`text-[11px] ${isDescripcionValid ? 'text-gray-500' : 'text-red-600'}`}>{descripcionLen}/1000</span>
        </div>
      </div>

      <div className="rounded-md border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className="w-full text-left px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 rounded-t-md"
        >
          Opciones avanzadas
        </button>
        <div className={`${showAdvanced ? 'block' : 'hidden'} p-3`}>
          <label className="block text-sm font-medium text-gray-700">Prioridad</label>
          <select
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
          {errors.prioridad && (
            <p className="mt-1 text-xs text-red-600">{errors.prioridad}</p>
          )}
        </div>
      </div>

      {error && error.code !== 'VALIDATION' && (
        <div className="rounded-md bg-red-50 p-3 text-red-800 text-sm">
          {error.message || 'Ha ocurrido un error.'}
          {onDismissError && (
            <button type="button" onClick={onDismissError} className="ml-2 text-red-700 underline">Cerrar</button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Crear ticket'}
        </button>
        {onDismissError && (
          <button type="button" onClick={onDismissError} className="text-sm text-gray-600">Limpiar errores</button>
        )}
      </div>
    </form>
  )
}
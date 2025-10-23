import React, { useState } from 'react'
import useAuth, { ROLES } from '../hooks/useAuth'

export default function CreateAccount({ onGoBack }) {
  const { signUpWithEmail, getAccountRole } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fixedRole = getAccountRole(email)

  async function handleCreate() {
    setInfo('')
    setError('')
    setLoading(true)
    try {
      if (fixedRole) {
        setError(`Este correo ya está registrado como ${fixedRole}. Usa Ingresar.`)
        return
      }
      if (!role) {
        setError('Selecciona un rol para crear la cuenta.')
        return
      }
      const { needsConfirmation, error } = await signUpWithEmail(email, password, role)
      if (error) {
        setError(String(error.message || error))
        return
      }
      if (needsConfirmation) setInfo('Registro realizado. Revisa tu correo para confirmar tu cuenta.')
      else setInfo('Cuenta creada y sesión iniciada.')
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    if (onGoBack) onGoBack()
    else window.location.hash = ''
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Volver
        </button>
        <h2 className="text-lg font-semibold">Crear cuenta</h2>
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {!fixedRole && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Rol de la cuenta</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona rol</option>
                <option value={ROLES.CLIENTE}>Cliente</option>
                <option value={ROLES.TECNICO}>Técnico</option>
              </select>
            </div>
          )}

          {fixedRole && (
            <div className="text-xs text-gray-600">Este correo está registrado como <span className="font-semibold">{fixedRole}</span>.</div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !!fixedRole || !role}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Crear cuenta
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
            {info && <span className="text-xs text-green-600">{info}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
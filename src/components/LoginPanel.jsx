import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'

export default function LoginPanel() {
  const { user, role, isAuthenticated, authError, loginWithEmail, logout, isTecnico, isCliente, getAccountRole } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const fixedRole = getAccountRole(email)

  async function handleLogin() {
    setInfo('')
    setLoading(true)
    try {
      const ok = await loginWithEmail(email, password)
      if (ok) {
        if (fixedRole) {
          setInfo(`Sesión iniciada como ${fixedRole}.`)
        } else {
          setInfo('Sesión iniciada.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  function goToCreateAccount() {
    window.location.hash = '#/crear-cuenta'
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
      {!isAuthenticated ? (
        <div className="flex flex-col gap-3">
          <span className="text-sm text-gray-700">Acceder</span>
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

          {fixedRole && (
            <div className="text-xs text-gray-600">Este correo está registrado como <span className="font-semibold">{fixedRole}</span>.</div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border bg-white text-gray-800 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={goToCreateAccount}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Crear cuenta
            </button>
            {authError && (
              <span className="text-xs text-red-600">Error: {String(authError.message || authError)}</span>
            )}
            {info && (
              <span className="text-xs text-green-600">{info}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Sesión iniciada: {user?.email || 'usuario'}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isTecnico ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white'}`}>Rol: {role || (isTecnico ? 'TECNICO' : isCliente ? 'CLIENTE' : 'SIN ROL')}</span>
          <button type="button" onClick={logout} className="ml-auto px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-100">Salir</button>
        </div>
      )}
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabaseEnv } from '../supabaseClient'

const STORAGE_KEY = 'app_role'
const USER_STORAGE_KEY = 'app_user'
const ROLE_MAP_STORAGE_KEY = 'app_role_map'
export const ROLES = {
  CLIENTE: 'CLIENTE',
  TECNICO: 'TECNICO',
}

function normalizeEmail(s) {
  return String(s || '').trim().toLowerCase()
}

// Mapa persistente email -> rol (para fijar rol por cuenta)
function getRoleMap() {
  try {
    const raw = localStorage.getItem(ROLE_MAP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (_) {
    return {}
  }
}
function saveRoleMap(map) {
  try { localStorage.setItem(ROLE_MAP_STORAGE_KEY, JSON.stringify(map)) } catch (_) {}
}
function getStoredRole(email) {
  const key = normalizeEmail(email)
  if (!key) return undefined
  const map = getRoleMap()
  return map[key]
}
function saveStoredRole(email, role) {
  const key = normalizeEmail(email)
  if (!key || !role) return
  const map = getRoleMap()
  map[key] = role
  saveRoleMap(map)
}

// Simple bus para sincronizar auth entre instancias del hook
const subscribers = new Set()
function emitAuthChange(payload) {
  subscribers.forEach(fn => {
    try { fn(payload) } catch (_) {}
  })
}

export default function useAuth() {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || ''
    } catch (_) {
      return ''
    }
  })
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (_) {
      return null
    }
  })
  const [authError, setAuthError] = useState(null)
  const isAuthenticated = !!user

  useEffect(() => {
    try {
      if (role) localStorage.setItem(STORAGE_KEY, role)
      else localStorage.removeItem(STORAGE_KEY)
    } catch (_) {}
  }, [role])

  useEffect(() => {
    try {
      if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(USER_STORAGE_KEY)
    } catch (_) {}
  }, [user])

  // Suscribirse al bus local para sincronizar cambios entre componentes
  useEffect(() => {
    const handler = ({ role: newRole, user: newUser }) => {
      if (typeof newRole !== 'undefined') setRole(newRole)
      if (typeof newUser !== 'undefined') setUser(newUser)
    }
    subscribers.add(handler)
    return () => { subscribers.delete(handler) }
  }, [])

  // Cargar sesión inicial y suscribirse a cambios de auth de Supabase (si existe)
  useEffect(() => {
    let unsub = null
    async function init() {
      if (!hasSupabaseEnv || !supabase) return
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      emitAuthChange({ user: data.session?.user || null })
      unsub = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
        emitAuthChange({ user: session?.user || null })
      })
    }
    init()
    return () => {
      try { if (unsub && typeof unsub?.data?.subscription?.unsubscribe === 'function') unsub.data.subscription.unsubscribe() } catch (_) {}
    }
  }, [])

  // Derivados
  const isCliente = role === ROLES.CLIENTE
  const isTecnico = role === ROLES.TECNICO

  // Acciones
  async function loginWithEmail(email, password, asRole) {
    setAuthError(null)
    try {
      let metaRole
      const emailKey = normalizeEmail(email)
      if (!hasSupabaseEnv || !supabase) {
        const localUser = { id: 'local', email }
        setUser(localUser)
        emitAuthChange({ user: localUser })
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setUser(data.user || null)
        emitAuthChange({ user: data.user || null })
        metaRole = data?.user?.user_metadata?.role
      }
      const enforcedRole = getStoredRole(emailKey) || metaRole
      if (enforcedRole === ROLES.CLIENTE || enforcedRole === ROLES.TECNICO) {
        setRole(enforcedRole)
        emitAuthChange({ role: enforcedRole })
        saveStoredRole(emailKey, enforcedRole)
      } else if (asRole === ROLES.CLIENTE || asRole === ROLES.TECNICO) {
        setRole(asRole)
        emitAuthChange({ role: asRole })
        saveStoredRole(emailKey, asRole)
      }
      return true
    } catch (err) {
      setAuthError(err)
      return false
    }
  }

  async function signUpWithEmail(email, password, asRole) {
    setAuthError(null)
    try {
      const emailKey = normalizeEmail(email)
      if (!hasSupabaseEnv || !supabase) {
        const localUser = { id: 'local', email }
        setUser(localUser)
        emitAuthChange({ user: localUser })
        if (asRole === ROLES.CLIENTE || asRole === ROLES.TECNICO) {
          setRole(asRole)
          emitAuthChange({ role: asRole })
          saveStoredRole(emailKey, asRole)
        }
        return { needsConfirmation: false }
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      const hasSession = !!data.session
      if (hasSession) {
        setUser(data.user || null)
        emitAuthChange({ user: data.user || null })
        if (asRole === ROLES.CLIENTE || asRole === ROLES.TECNICO) {
          try { await supabase.auth.updateUser({ data: { role: asRole } }) } catch (_) {}
        }
      }
      if (asRole === ROLES.CLIENTE || asRole === ROLES.TECNICO) {
        setRole(asRole)
        emitAuthChange({ role: asRole })
        saveStoredRole(emailKey, asRole)
      }
      return { needsConfirmation: !hasSession }
    } catch (err) {
      setAuthError(err)
      return { needsConfirmation: false, error: err }
    }
  }

  async function logout() {
    setAuthError(null)
    try {
      if (hasSupabaseEnv && supabase) await supabase.auth.signOut()
    } catch (_) {}
    setUser(null)
    setRole('')
    emitAuthChange({ role: '', user: null })
  }

  const actions = useMemo(() => ({
    loginAsCliente: () => { setRole(ROLES.CLIENTE); emitAuthChange({ role: ROLES.CLIENTE }) },
    loginAsTecnico: () => { setRole(ROLES.TECNICO); emitAuthChange({ role: ROLES.TECNICO }) },
    loginWithEmail,
    signUpWithEmail,
    logout,
  }), [])

  function getAccountRole(email) {
    return getStoredRole(email)
  }

  return { role, isCliente, isTecnico, user, isAuthenticated, authError, loginWithEmail, signUpWithEmail, logout, getAccountRole }
}
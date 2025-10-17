import { createClient } from '@supabase/supabase-js'

// Credenciales de Supabase desde variables de entorno (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan variables de entorno: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY')
}

// Crear el cliente de Supabase con opciones para evitar problemas de RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

// Función de utilidad para verificar la conexión
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('tickets').select('count')
    if (error) {
      console.error('Error de conexión a Supabase:', error)
      return false
    }
    console.log('Conexión a Supabase exitosa')
    return true
  } catch (err) {
    console.error('Error de conexión:', err)
    return false
  }
}

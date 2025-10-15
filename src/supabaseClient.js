import { createClient } from '@supabase/supabase-js'

// Credenciales de Supabase
// Obtenidas desde el dashboard de Supabase > Settings > API
const supabaseUrl = 'https://cdahaxnpufcyykcevuzu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYWhheG5wdWZjeXlrY2V2dXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjUxNzgsImV4cCI6MjA3NjA0MTE3OH0.HIi9u4SNJUdXwYBlyT0wnjDsU1CKpaShZwBOhvLl4wA'

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

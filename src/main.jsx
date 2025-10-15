import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#333' }}>¡Sistema de Tickets de Soporte!</h1>
      <p style={{ color: '#666', marginTop: '10px' }}>
        Si puedes ver este mensaje, React está funcionando correctamente.
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        display: 'inline-block'
      }}>
        <h2>Próximos pasos:</h2>
        <ol style={{ textAlign: 'left', marginTop: '10px' }}>
          <li>Configura Supabase</li>
          <li>Crea la tabla de tickets</li>
          <li>¡Disfruta tu sistema!</li>
        </ol>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
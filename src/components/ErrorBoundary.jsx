import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Útil para depuración en producción
    console.error('ErrorBoundary atrapó un error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto p-6">
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">
            <h2 className="text-lg font-semibold">Algo salió mal</h2>
            <p className="mt-2 text-sm">
              Verifica que las variables de entorno estén configuradas en Vercel:
              <code className="ml-1">VITE_SUPABASE_URL</code> y
              <code className="ml-1">VITE_SUPABASE_ANON_KEY</code>.
            </p>
            {this.state.error?.message && (
              <p className="mt-2 text-xs">Detalle: {String(this.state.error.message)}</p>
            )}
            <button
              className="mt-3 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              onClick={() => window.location.reload()}
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
// Componente presentacional del encabezado/hero.
// Se mantiene simple, enfocado en UI y sin lógica de negocio.

import React from 'react'

const Header = ({ onCreateClick }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-gray-100 border border-gray-200 shadow-sm mb-10 sm:mb-12">
      <div className="px-6 sm:px-10 py-12 sm:py-16 text-center">
        <span className="inline-block mb-4 sm:mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-white border border-gray-200 text-gray-700 shadow-sm">
          SISTEMA DE TICKETS
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
          Agiliza la atención al cliente con un sistema de tickets
        </h1>
        <p className="mt-4 sm:mt-6 text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
          Crea, actualiza y cierra tickets en segundos con una UI moderna.
        </p>
        <div className="mt-8 sm:mt-10">
          <button onClick={onCreateClick} className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors">
            Crear ticket gratis
          </button>
        </div>
      </div>
    </section>
  )
}

export default Header
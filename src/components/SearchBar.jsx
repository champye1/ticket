// Campo de búsqueda controlado: filtra tickets por título o descripción.
// Recibe el valor y un handler para actualizar el término en el hook.

import React from 'react'

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="w-full sm:w-96">
      <label htmlFor="search" className="sr-only">Buscar</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por título o descripción"
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  )
}

export default SearchBar
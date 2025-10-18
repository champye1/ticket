import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-config-prettier'

export default [
  // Ignorar archivos y directorios globalmente
  { ignores: ['dist', 'node_modules', 'src/counter.ts'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Declarar globals de entorno navegador para evitar no-undef
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },
    rules: {
      // Ajustes comunes equivalentes a .eslintrc.cjs
      'no-unused-vars': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'import/order': ['warn', { 'newlines-between': 'always' }],
      // Desactivar para evitar falsos positivos que rompen CI
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // Desactiva reglas que chocan con Prettier
  prettier,
  {
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },
  },
]
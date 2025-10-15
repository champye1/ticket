# Sistema de Tickets de Soporte

Un sistema de gestión de tickets de soporte construido con React, Vite y Supabase.

## 🚀 Características

- ✅ Crear, editar y eliminar tickets
- ✅ Gestión de estados (Abierto, En Progreso, Cerrado)
- ✅ Prioridades (Baja, Media, Alta)
- ✅ Dashboard con estadísticas
- ✅ Interfaz moderna y responsive
- ✅ Base de datos en tiempo real con Supabase

## 📋 Prerequisitos

- Node.js (versión 16 o superior)
- Cuenta de Supabase

## 🛠️ Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura Supabase:
   - Ve a tu [dashboard de Supabase](https://supabase.com/dashboard)
   - Crea un nuevo proyecto
   - Ve a Settings > API
   - Copia la URL del proyecto y la clave 'anon public'
   - Actualiza el archivo `src/supabaseClient.js` con tus credenciales

4. Configura la base de datos:
   - Ve a SQL Editor en tu dashboard de Supabase
   - Ejecuta el siguiente SQL para crear la tabla de tickets:

   ```sql
   CREATE TABLE tickets (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     customer_name TEXT NOT NULL,
     customer_email TEXT NOT NULL,
     priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
     status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Crear función para actualizar updated_at automáticamente
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   -- Crear trigger para actualizar updated_at
   CREATE TRIGGER update_tickets_updated_at
     BEFORE UPDATE ON tickets
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

6. Abre tu navegador en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Dashboard.jsx      # Componente principal del dashboard
│   ├── TicketList.jsx     # Lista de tickets
│   └── TicketForm.jsx     # Formulario para crear/editar tickets
├── supabaseClient.js      # Configuración de Supabase
├── App.jsx               # Componente raíz
├── main.jsx              # Punto de entrada
└── index.css             # Estilos globales
```

## 🎨 Tecnologías Utilizadas

- **React** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción rápida
- **Supabase** - Backend como servicio (BaaS)
- **Tailwind CSS** - Framework de CSS utilitario
- **Lucide React** - Iconos

## 📝 Uso

1. **Crear un ticket**: Haz clic en "Nuevo Ticket" y completa el formulario
2. **Ver tickets**: Todos los tickets se muestran en el dashboard principal
3. **Actualizar estado**: Usa el selector de estado en cada ticket
4. **Editar ticket**: Haz clic en el icono de editar
5. **Eliminar ticket**: Haz clic en el icono de eliminar

## 🔧 Configuración de Supabase

### Variables de Entorno (Opcional)

Puedes crear un archivo `.env.local` para manejar las credenciales de forma más segura:

```env
VITE_SUPABASE_URL=tu_supabase_url_aqui
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

Luego actualiza `src/supabaseClient.js`:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Despliega automáticamente

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

# Diseño de Interfaz de Usuario - Sistema de Notificación de Altas y Bajas

## Visión General

El diseño de la interfaz de usuario para el sistema de notificación de altas y bajas de fisioterapeutas se basa en los requisitos identificados y las capturas de pantalla proporcionadas en el documento PDF. La interfaz será intuitiva, responsive y seguirá los principios de diseño moderno utilizando React.js y Tailwind CSS.

## Estructura General

La aplicación tendrá la siguiente estructura de navegación:

```
+----------------------------------+
|           Cabecera               |
|  Logo | Título | Usuario | Menú  |
+----------------------------------+
|                                  |
|           Contenido              |
|                                  |
|  (Cambia según la sección)       |
|                                  |
+----------------------------------+
|           Pie de página          |
|  Información | Versión | Ayuda   |
+----------------------------------+
```

## Páginas Principales

### 1. Inicio de Sesión

![Inicio de Sesión](mockups/login.png)

- Formulario de inicio de sesión con:
  - Campo de correo electrónico
  - Campo de contraseña
  - Botón de inicio de sesión
  - Enlace para recuperar contraseña

### 2. Dashboard

![Dashboard](mockups/dashboard.png)

- Resumen de actividad:
  - Número de fisioterapeutas activos
  - Número de fisioterapeutas inactivos
  - Últimas altas y bajas
  - Notificaciones pendientes
- Accesos rápidos a las principales funciones

### 3. Gestión de Altas

![Gestión de Altas](mockups/altas.png)

#### 3.1. Subida de Contratos

- Área para arrastrar y soltar archivos
- Botón para seleccionar archivos
- Lista de archivos subidos con:
  - Nombre del archivo
  - Fecha de subida
  - Estado (Pendiente, Procesado)
  - Acciones (Ver, Eliminar)

#### 3.2. Registro de Nuevas Altas

- Tabla "ALTAS NUEVAS" con:
  - Columna NOMBRE (campo de texto)
  - Columna APELLIDOS (campo de texto)
  - Columna FECHA ALTA (selector de fecha)
  - Columna MAIL (campo de texto)
  - Columna FINESS (campo de texto)
  - Columna ENVIAR (casilla de verificación)
- Botón "Comunicar Altas por mail"

### 4. Gestión de Bajas

![Gestión de Bajas](mockups/bajas.png)

- Tabla "T_ALTAS" con:
  - Columna NOMBRE (solo lectura)
  - Columna APELLIDOS (solo lectura)
  - Columna FECHA ALTA (solo lectura)
  - Columna MAIL (solo lectura)
  - Columna FINESS (solo lectura)
  - Columna FECHA BAJA (selector de fecha)
  - Columna ENVIAR BAJA (casilla de verificación)
  - Columna NOTIFICADO EL (solo lectura)
- Botón "Comunicar Bajas por mail"

### 5. Listado de Fisioterapeutas Activos

![Listado Activos](mockups/activos.png)

- Tabla "T_ALTAS" con:
  - Columna NOMBRE
  - Columna APELLIDOS
  - Columna FECHA ALTA
  - Columna MAIL
  - Columna FINESS
  - Columna NOTIFICADO EL
- Filtros de búsqueda
- Exportación a Excel/PDF

### 6. Listado de Fisioterapeutas Inactivos

![Listado Inactivos](mockups/inactivos.png)

- Tabla "T_BAJAS" con:
  - Columna NOMBRE
  - Columna APELLIDOS
  - Columna FECHA ALTA
  - Columna FECHA BAJA
  - Columna MAIL
  - Columna FINESS
  - Columna NOTIFICADO EL
- Filtros de búsqueda
- Exportación a Excel/PDF

### 7. Configuración

![Configuración](mockups/configuracion.png)

- Configuración de correo electrónico:
  - Servidor SMTP
  - Puerto
  - Usuario
  - Contraseña
  - Email remitente
- Configuración de plantillas de correo:
  - Editor para cada tipo de plantilla
  - Variables disponibles
  - Vista previa
- Configuración de destinatarios:
  - Colegio de Fisioterapeutas
  - Seguridad Social
- Configuración general:
  - Ruta de almacenamiento de contratos
  - Número FINESS del gabinete
  - Firma de correo electrónico

### 8. Gestión de Usuarios

![Gestión de Usuarios](mockups/usuarios.png)

- Tabla de usuarios con:
  - Nombre
  - Apellidos
  - Email
  - Rol
  - Estado
  - Acciones (Editar, Desactivar)
- Formulario para añadir/editar usuarios

## Componentes Reutilizables

### 1. Menú Principal

```jsx
<nav className="bg-gray-800 text-white">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img className="h-8 w-8" src="/logo.svg" alt="Logo" />
        </div>
        <div className="ml-4 flex items-baseline space-x-4">
          <a href="#" className="px-3 py-2 rounded-md text-sm font-medium bg-gray-900">Dashboard</a>
          <div className="relative group">
            <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              Gestión Altas y Bajas
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Comunicar Altas por mail</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Comunicar Bajas por mail</a>
            </div>
          </div>
          <a href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Fisioterapeutas Activos</a>
          <a href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Fisioterapeutas Inactivos</a>
          <a href="#" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Configuración</a>
        </div>
      </div>
      <div className="flex items-center">
        <div className="ml-4 flex items-center md:ml-6">
          <div className="relative">
            <button className="flex items-center text-sm focus:outline-none">
              <span className="mr-2">Usuario</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cerrar sesión</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>
```

### 2. Tabla de Datos

```jsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((row) => (
        <tr key={row.id}>
          {columns.map((column) => (
            <td key={`${row.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
              {renderCell(row, column)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 3. Formulario de Alta

```jsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
    <div className="sm:col-span-3">
      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
        Nombre
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="nombre"
          id="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>

    <div className="sm:col-span-3">
      <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
        Apellidos
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="apellidos"
          id="apellidos"
          value={formData.apellidos}
          onChange={handleChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>

    <div className="sm:col-span-2">
      <label htmlFor="fecha_alta" className="block text-sm font-medium text-gray-700">
        Fecha Alta
      </label>
      <div className="mt-1">
        <input
          type="date"
          name="fecha_alta"
          id="fecha_alta"
          value={formData.fecha_alta}
          onChange={handleChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>

    <div className="sm:col-span-2">
      <label htmlFor="mail" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <div className="mt-1">
        <input
          type="email"
          name="mail"
          id="mail"
          value={formData.mail}
          onChange={handleChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>

    <div className="sm:col-span-2">
      <label htmlFor="finess" className="block text-sm font-medium text-gray-700">
        FINESS
      </label>
      <div className="mt-1">
        <input
          type="text"
          name="finess"
          id="finess"
          value={formData.finess}
          onChange={handleChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>

    <div className="sm:col-span-1">
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            id="enviar"
            name="enviar"
            type="checkbox"
            checked={formData.enviar}
            onChange={handleChange}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="enviar" className="font-medium text-gray-700">
            Enviar
          </label>
        </div>
      </div>
    </div>
  </div>

  <div className="pt-5">
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleCancel}
        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Guardar
      </button>
    </div>
  </div>
</form>
```

### 4. Botón de Acción

```jsx
<button
  type="button"
  onClick={handleClick}
  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
  {icon && (
    <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      {/* Icon path */}
    </svg>
  )}
  {text}
</button>
```

### 5. Modal de Confirmación

```jsx
{isOpen && (
  <div className="fixed z-10 inset-0 overflow-y-auto">
    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

## Paleta de Colores

- **Primario**: #4F46E5 (Indigo 600)
- **Secundario**: #10B981 (Emerald 500)
- **Acento**: #F59E0B (Amber 500)
- **Fondo**: #F9FAFB (Gray 50)
- **Texto**: #111827 (Gray 900)
- **Texto Secundario**: #6B7280 (Gray 500)
- **Éxito**: #10B981 (Emerald 500)
- **Error**: #EF4444 (Red 500)
- **Advertencia**: #F59E0B (Amber 500)
- **Info**: #3B82F6 (Blue 500)

## Tipografía

- **Familia principal**: Inter, sans-serif
- **Tamaños**:
  - Título principal: 24px (1.5rem)
  - Título secundario: 20px (1.25rem)
  - Subtítulo: 16px (1rem)
  - Texto normal: 14px (0.875rem)
  - Texto pequeño: 12px (0.75rem)

## Responsive Design

La interfaz se adaptará a diferentes tamaños de pantalla:

- **Móvil** (< 640px): Diseño de una columna, menú colapsable
- **Tablet** (640px - 1024px): Diseño de dos columnas, menú simplificado
- **Escritorio** (> 1024px): Diseño completo, todas las funcionalidades visibles

## Accesibilidad

- Contraste adecuado entre texto y fondo
- Etiquetas descriptivas para todos los campos de formulario
- Mensajes de error claros y específicos
- Navegación por teclado
- Compatibilidad con lectores de pantalla

## Animaciones y Transiciones

- Transiciones suaves para cambios de estado (hover, focus, active)
- Animaciones sutiles para cargas y acciones completadas
- Feedback visual para acciones del usuario

## Consideraciones Adicionales

- Modo oscuro (opcional)
- Soporte para múltiples idiomas (español y francés)
- Indicadores de carga para operaciones asíncronas
- Mensajes de confirmación para acciones importantes
- Sistema de notificaciones para alertas y mensajes del sistema

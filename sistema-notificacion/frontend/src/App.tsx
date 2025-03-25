import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importar páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FisioterapeutasActivos from './pages/fisioterapeutas/FisioterapeutasActivos';
import FisioterapeutasInactivos from './pages/fisioterapeutas/FisioterapeutasInactivos';
import FisioterapeutaDetalle from './pages/fisioterapeutas/FisioterapeutaDetalle';
import FisioterapeutaForm from './pages/fisioterapeutas/FisioterapeutaForm';
import NotificacionesPage from './pages/notificaciones/NotificacionesPage';
import PlantillasPage from './pages/configuracion/PlantillasPage';
import DestinatariosPage from './pages/configuracion/DestinatariosPage';
import UsuariosPage from './pages/configuracion/UsuariosPage';
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage';
import NotFound from './pages/NotFound';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ element: React.ReactNode; allowedRoles?: string[] }> = ({ 
  element, 
  allowedRoles = [] 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{element}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={5000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute element={<Dashboard />} />
          } />
          
          <Route path="/fisioterapeutas/activos" element={
            <ProtectedRoute element={<FisioterapeutasActivos />} />
          } />
          
          <Route path="/fisioterapeutas/inactivos" element={
            <ProtectedRoute element={<FisioterapeutasInactivos />} />
          } />
          
          <Route path="/fisioterapeutas/nuevo" element={
            <ProtectedRoute element={<FisioterapeutaForm />} allowedRoles={['ADMIN']} />
          } />
          
          <Route path="/fisioterapeutas/editar/:id" element={
            <ProtectedRoute element={<FisioterapeutaForm />} allowedRoles={['ADMIN']} />
          } />
          
          <Route path="/fisioterapeutas/:id" element={
            <ProtectedRoute element={<FisioterapeutaDetalle />} />
          } />
          
          <Route path="/notificaciones" element={
            <ProtectedRoute element={<NotificacionesPage />} />
          } />
          
          <Route path="/configuracion/plantillas" element={
            <ProtectedRoute element={<PlantillasPage />} allowedRoles={['ADMIN']} />
          } />
          
          <Route path="/configuracion/destinatarios" element={
            <ProtectedRoute element={<DestinatariosPage />} allowedRoles={['ADMIN']} />
          } />
          
          <Route path="/configuracion/usuarios" element={
            <ProtectedRoute element={<UsuariosPage />} allowedRoles={['ADMIN']} />
          } />
          
          <Route path="/configuracion" element={
            <ProtectedRoute element={<ConfiguracionPage />} allowedRoles={['ADMIN']} />
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

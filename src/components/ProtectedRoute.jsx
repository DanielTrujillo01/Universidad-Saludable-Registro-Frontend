import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Verificamos si existe el token en localStorage
  // Ojo: Para mayor seguridad, idealmente validarías si el token no ha expirado
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Si no hay token, redirigir al login del admin
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizar la ruta hija (el dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
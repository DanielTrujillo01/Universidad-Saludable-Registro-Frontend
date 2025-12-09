import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { RegistroPersonas } from "../Pages/RegistroPersonas";
import { CreacionEntidades } from "../Pages/CreacionEntidades";
import ProtectedRoute from "../components/ProtectedRoute";
import { Login } from "../pages/Login";
import { StatsPage } from "../pages/StatsViews";

const RegisterRoutes = () => {
  return (
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/registro-personas" element={<RegistroPersonas />} />
        <Route path="/creacion-entidades" element={<CreacionEntidades />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Protegidas */}
        <Route element={<ProtectedRoute />}>
            <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
  );
};

export default RegisterRoutes;
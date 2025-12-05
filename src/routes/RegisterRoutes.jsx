import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import {RegistroPersonas} from "../Pages/RegistroPersonas";
import {CreacionEntidades} from "../Pages/CreacionEntidades";
import { DashBoard } from "../pages/DashBoard";
import  ProtectedRoute  from "../components/ProtectedRoute";
import { Login } from "../pages/Login";
/**
 * Router component for the Meeting5 application.
 *
 * Defines all the app routes and wraps them in the main layout.
 * @returns {JSX.Element}
 */

const RegisterRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro-personas" element={<RegistroPersonas />} />
        <Route path="/creacion-entidades" element={<CreacionEntidades />} />
        <Route path="/login" element={<Login />} />
        {<Route element={<ProtectedRoute />}>
           <Route path="/dashboard" element={<DashBoard />} />
        </Route> }
      </Routes>
  );
};

export default RegisterRoutes;
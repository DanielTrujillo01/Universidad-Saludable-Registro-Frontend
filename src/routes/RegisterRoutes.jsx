import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import {RegistroPersonas} from "../Pages/RegistroPersonas";
import {CreacionEntidades} from "../Pages/CreacionEntidades";
import {ActivityModal} from "../components/ActivityModal";

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
      </Routes>
  );
};

export default RegisterRoutes;
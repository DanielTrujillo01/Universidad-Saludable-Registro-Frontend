import { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Importamos tu función personalizada
import { apiRequest } from "../api/api";

import { 
  Mail, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  ShieldCheck 
} from "lucide-react";

export function Login() { 
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "", 
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); 
    
    try {
      // 2. Usamos apiRequest en lugar de axios directo
      // "login" debe coincidir con la clave que agregaste en API_ENDPOINTS en api.js
      const data = await apiRequest("login", "POST", {
        username: formData.email, // Mapeamos email -> username para Django
        password: formData.password
      });

      // 3. apiRequest ya devuelve response.data, así que destructuramos directo
      const { access, refresh } = data;

      // 4. Guardar tokens
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      console.log("Login exitoso vía API Centralizada");
      
      // 5. Redirigir
      navigate("/dashboard"); 

    } catch (err) {
      console.error("Error en login:", err);

      // Manejo de errores (el error burbujea desde axios dentro de apiRequest)
      if (err.response) {
        if (err.response.status === 401) {
            setError("Usuario o contraseña incorrectos.");
        } else {
            setError("Ocurrió un error en el servidor. Intenta más tarde.");
        }
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      } else {
        setError("Error inesperado en la aplicación.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-indigo-50 relative animate-fade-in-up">
        
        <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>

        <div className="p-8">
          
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="text-center mb-8 mt-4">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Acceso Administrativo</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ingresa tus credenciales para gestionar el sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 ml-1">
                Usuario / Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="admin"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Ingresar
                </>
              )}
            </button>
          </form>

        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Sistema Seguro © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const LoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginAdmin(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 font-sans text-stone-50">
      <div className="max-w-md w-full bg-stone-950 rounded-lg shadow-2xl border border-stone-800 p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-stone-900 p-3 rounded-full border border-stone-800">
            <ShieldCheck className="w-8 h-8 text-stone-400" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-stone-50 mb-1">
          Panel de Gestión
        </h2>
        <p className="text-sm text-stone-400 text-center mb-8">
          Ingresa al centro de control de asistencias
        </p>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md mb-6 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-200 mb-1.5">
              Email Administrativo
            </label>
            <input
              type="email"
              required
              placeholder="admin@nexo0km.com"
              className="flex h-10 w-full rounded-md border border-stone-800 bg-stone-950 px-3 py-2 text-sm ring-offset-stone-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-stone-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-200 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-stone-800 bg-stone-950 px-3 py-2 text-sm ring-offset-stone-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-stone-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-stone-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-stone-50 text-stone-950 hover:bg-stone-50/90 h-10 px-4 py-2 w-full mt-2"
          >
            Acceso Seguro
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-stone-800 text-center">
          <a
            href="/login"
            className="text-sm text-stone-500 hover:text-stone-300 underline underline-offset-4 transition-colors"
          >
            ¿Eres empleado? Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

const LoginEmpleado = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginEmpleado } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginEmpleado(identifier, password);
      navigate("/marcar");
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-sm border border-border p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-muted p-3 rounded-full">
            <User className="w-8 h-8 text-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-foreground mb-1">
          Acceso Empleado
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Ingresa tus credenciales para marcar asistencia
        </p>
        
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6 border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email o DNI
            </label>
            <input
              type="text"
              required
              placeholder="nombre@ejemplo.com o 12345678"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2"
          >
            Iniciar Sesión
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-border text-center">
          <a
            href="/admin/login"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            ¿Eres administrador? Ingreso Gestión
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginEmpleado;

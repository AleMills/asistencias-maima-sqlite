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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-900 p-3 rounded-full">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Admin Portal
        </h2>
        {error && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-center border border-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Acceder
          </button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            ¿Eres empleado? Ingresa aquí
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;

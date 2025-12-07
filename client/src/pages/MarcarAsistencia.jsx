import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  Fingerprint,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MarcarAsistencia = () => {
  const [status, setStatus] = useState("ready"); // ready, loading, success, error
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Auto-close window after successful mark
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        window.close();
      }, 2000); // Close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleMarcar = async () => {
    setStatus("loading");
    try {
      const res = await api.post("/asistencias/marcar", {
        userAgent: navigator.userAgent,
      });
      setStatus("success");
      setMessage(res.data.message);
      setDetails(res.data);
    } catch (error) {
      setStatus("error");
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Error de conexión o red");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden text-center p-8">
        {status === "ready" && (
          <div className="flex flex-col items-center py-6">
            <div className="bg-blue-100 p-6 rounded-full mb-6">
              <Fingerprint className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Marcar Asistencia
            </h2>
            <p className="text-gray-600 mb-8">
              Hola,{" "}
              <span className="font-semibold text-gray-800">
                {user?.nombre}
              </span>
            </p>
            <button
              onClick={handleMarcar}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Marcar Ahora
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Procesando marca...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
            {details && (
              <div className="bg-green-50 p-4 rounded-lg mt-4 w-full">
                <p className="text-green-800 font-medium text-lg">
                  {details.hora}
                </p>
                <p className="text-green-600 text-sm mt-1">{details.tipo}</p>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-4">
              Esta ventana se cerrará automáticamente...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
            <XCircle className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 text-lg mb-4">{message}</p>
            <button
              onClick={() => setStatus("ready")}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* <div className="mt-8 border-t pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default MarcarAsistencia;

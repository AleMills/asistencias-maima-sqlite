import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Fingerprint,
} from "lucide-react";

const MarcarAsistencia = () => {
  const [status, setStatus] = useState("ready"); // ready, loading, success, error
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (status === "success") {
      // Intentar cerrar la ventana (solo funciona si fue abierta por window.open)
      const closeTimer = setTimeout(() => {
        window.close();
      }, 2000);

      // Si window.close() no funcionó (el navegador lo bloqueó),
      // actualizar el estado para mostrar el mensaje "ya podés cerrar"
      const fallbackTimer = setTimeout(() => {
        setStatus("done");
      }, 2700);

      return () => {
        clearTimeout(closeTimer);
        clearTimeout(fallbackTimer);
      };
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
      setMessage(error.response?.data?.message || "Error de conexión o red");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-sm border border-border overflow-hidden text-center p-8">
        {status === "ready" && (
          <div className="flex flex-col items-center py-6">
            <div className="bg-muted p-6 rounded-full mb-6 border border-border">
              <Fingerprint className="w-16 h-16 text-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Registro de Asistencia
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Hola, <span className="font-medium text-foreground">{user?.nombre}</span>. Presiona el botón para registrar tu entrada o salida.
            </p>
            <button
              onClick={handleMarcar}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 w-full shadow-sm active:scale-95"
            >
              Marcar Ahora
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Procesando marca...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">{message}</h2>
            {details && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4 w-full">
                <p className="text-green-600 font-bold text-xl">
                  {details.hora}
                </p>
                <p className="text-green-600/80 text-xs font-medium uppercase tracking-wider mt-1">{details.tipo}</p>
              </div>
            )}
            <p className="text-muted-foreground text-xs mt-6">
              Cerrando ventana automáticamente...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
            <XCircle className="w-20 h-20 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Error</h2>
            <p className="text-destructive text-sm mb-6">{message}</p>
            <button
              onClick={() => setStatus("ready")}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">¡Asistencia registrada!</h2>
            <p className="text-muted-foreground text-sm">
              Ya podés cerrar esta pestaña.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarcarAsistencia;

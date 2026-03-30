import { useState, useEffect } from "react";
import api from "../services/api";
import { X, AlertTriangle, Check, Loader2 } from "lucide-react";

const ManualMarkModal = ({ isOpen, onClose, onSuccess, empleadoId, fecha }) => {
  const [password, setPassword] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("INGRESO"); // INGRESO or EGRESO
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      const now = new Date();
      const hhmm = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
      setHora(hhmm);
      setError("");
      setTipo("INGRESO");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/asistencias/manual", {
        empleadoId,
        fecha,
        hora,
        tipo,
        password,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al marcar asistencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Marca Manual</h3>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Registra una asistencia manualmente para el empleado seleccionado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">Seguridad</p>
              <p className="text-sm text-yellow-700/80">
                Esta acción requiere confirmar su contraseña de administrador.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium p-3 rounded-md text-center animate-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tipo de Marca
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="INGRESO">INGRESO</option>
                <option value="EGRESO">EGRESO</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium leading-none">
                Hora del Registro
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium leading-none">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de administrador"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mt-2 sm:mt-0 inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Procesando
                </>
              ) : (
                <>
                  <Check className="mr-2 h-3 w-3" />
                  Confirmar Marca
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualMarkModal;

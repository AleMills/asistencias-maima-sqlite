import { useState, useEffect } from "react";
import api from "../services/api";
import { X, AlertTriangle } from "lucide-react";

const ManualMarkModal = ({ isOpen, onClose, onSuccess, empleadoId, fecha }) => {
  const [password, setPassword] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("INGRESO"); // INGRESO or EGRESO
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setHora(new Date().toTimeString().slice(0, 5)); // HH:mm
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
        hora, // HH:mm
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Marca Manual</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Esta acción requiere re-autenticación.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Marca
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="INGRESO">INGRESO</option>
              <option value="EGRESO">EGRESO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora (HH:mm)
            </label>
            <input
              type="time"
              required
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña de Admin
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Confirme su contraseña"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar Marca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualMarkModal;

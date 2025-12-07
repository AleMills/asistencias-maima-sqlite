import { useState, useEffect } from "react";
import api from "../services/api";
import { Download, Filter, PlusCircle, Users, QrCode, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import ManualMarkModal from "../components/ManualMarkModal";

const AdminDashboard = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [empleadoFiltro, setEmpleadoFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState("");

  useEffect(() => {
    fetchEmpleados();
  }, []);

  useEffect(() => {
    fetchAsistencias();
  }, [startDate, endDate, empleadoFiltro]);

  const fetchEmpleados = async () => {
    try {
      const res = await api.get("/empleados");
      setEmpleados(res.data);
    } catch (error) {
      console.error("Error fetching empleados", error);
    }
  };

  const fetchAsistencias = async () => {
    setLoading(true);
    try {
      const res = await api.get("/asistencias", {
        params: { from: startDate, to: endDate, empleadoId: empleadoFiltro },
      });
      setAsistencias(res.data);
    } catch (error) {
      console.error("Error fetching asistencias", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/asistencias/export", {
        params: { from: startDate, to: endDate }, // Export current filter or range
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `asistencias_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting", error);
    }
  };

  const openManualMark = (empleadoId) => {
    setSelectedEmpleadoId(empleadoId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl text-blue-600 font-bold">
                Control de asistencias <span className="text-2xl text-orange-500">MAIMA</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/empleados"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Users className="w-5 h-5 mr-1" /> Empleados
              </Link>
              <Link
                to="/admin/qr"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <QrCode className="w-5 h-5 mr-1" /> QR
              </Link>
              <Link
                to="/admin/llegadas-tarde"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Clock className="w-5 h-5 mr-1" /> Llegadas Tarde
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats / Actions */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asistencias</h2>
            <p className="text-gray-500">
              Gestiona y visualiza los ingresos y egresos.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col gap-4">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setStartDate(today);
                setEndDate(today);
              }}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              Hoy
            </button>
            <button
              onClick={() => {
                const curr = new Date();
                const first = curr.getDate() - curr.getDay() + 1; // Monday
                const last = first + 6; // Sunday
                const firstday = new Date(curr.setDate(first))
                  .toISOString()
                  .split("T")[0];
                const lastday = new Date(curr.setDate(last))
                  .toISOString()
                  .split("T")[0];
                setStartDate(firstday);
                setEndDate(lastday);
              }}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              Esta Semana
            </button>
            <button
              onClick={() => {
                const date = new Date();
                const firstDay = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  1
                )
                  .toISOString()
                  .split("T")[0];
                const lastDay = new Date(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  0
                )
                  .toISOString()
                  .split("T")[0];
                setStartDate(firstDay);
                setEndDate(lastDay);
              }}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
            >
              Este Mes
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div className="w-full sm:w-auto grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empleado
              </label>
              <select
                value={empleadoFiltro}
                onChange={(e) => setEmpleadoFiltro(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="">Todos</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.apellido}, {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => {
                  setStartDate(new Date().toISOString().split("T")[0]);
                  setEndDate(new Date().toISOString().split("T")[0]);
                  setEmpleadoFiltro("");
                }}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" /> Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Egreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : asistencias.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No hay registros para esta fecha.
                    </td>
                  </tr>
                ) : (
                  asistencias.map((asistencia) => (
                    <tr key={asistencia.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {asistencia.apellido}, {asistencia.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asistencia.fecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asistencia.horaIngreso || "-"}
                        {asistencia.marcadoPor === "admin" && (
                          <span
                            className="ml-2 text-xs text-orange-500"
                            title="Manual"
                          >
                            (M)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asistencia.horaEgreso || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {asistencia.horaIngreso && asistencia.horaEgreso ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completo
                          </span>
                        ) : asistencia.horaIngreso ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            En curso
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openManualMark(asistencia.empleadoId)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full"
                        >
                          <PlusCircle className="w-4 h-4 mr-1" /> Marcar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ManualMarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAsistencias}
        empleadoId={selectedEmpleadoId}
        fecha={startDate}
      />
    </div>
  );
};

export default AdminDashboard;

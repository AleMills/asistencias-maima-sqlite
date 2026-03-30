import { useState, useEffect } from "react";
import api from "../services/api";
import {
  Download,
  Filter,
  PlusCircle,
  Users,
  QrCode,
  Clock,
  Calendar,
  FileText,
} from "lucide-react";
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
        params: { from: startDate, to: endDate },
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

  const handleExportSesiones = async () => {
    try {
      const response = await api.get("/auth/export-sesiones", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sesiones_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting sesiones", error);
    }
  };

  const openManualMark = (empleadoId) => {
    setSelectedEmpleadoId(empleadoId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-sm font-bold tracking-tight">
                Control de Asistencias <span className="text-muted-foreground font-normal">|</span> <span className="font-black">Nexo 0km</span>
              </h1>
            </div>
            <div className="flex items-center space-x-1">
              <Link
                to="/admin/empleados"
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Users className="w-4 h-4 mr-2" /> Empleados
              </Link>
              <Link
                to="/admin/qr"
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <QrCode className="w-4 h-4 mr-2" /> QR
              </Link>
              <Link
                to="/admin/llegadas-tarde"
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Clock className="w-4 h-4 mr-2" /> Reportes
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tighter">Panel de Asistencias</h2>
            <p className="text-sm text-muted-foreground">
              Visualiza y gestiona el flujo de ingresos y egresos de tu equipo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={handleExportSesiones}
              className="inline-flex flex-1 md:flex-none items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <FileText className="w-3.5 h-3.5 mr-2" />
              Sesiones
            </button>
            <button
              onClick={handleExport}
              className="inline-flex flex-1 md:flex-none items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow"
            >
              <Download className="w-3.5 h-3.5 mr-2" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm mb-8">
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Empleado</label>
              <select
                value={empleadoFiltro}
                onChange={(e) => setEmpleadoFiltro(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Todos los empleados</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.apellido}, {emp.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 md:col-span-1 lg:col-span-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setStartDate(today);
                  setEndDate(today);
                }}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  setStartDate(new Date().toISOString().split("T")[0]);
                  setEndDate(new Date().toISOString().split("T")[0]);
                  setEmpleadoFiltro("");
                }}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground text-destructive"
              >
                <Filter className="w-3 h-3 mr-2" /> Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_th]:tracking-tighter [&_th]:text-[10px]">
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Ingreso</th>
                  <th>Egreso</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-muted-foreground italic">
                      Cargando información...
                    </td>
                  </tr>
                ) : asistencias.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-muted-foreground italic">
                      No se encontraron registros de asistencia.
                    </td>
                  </tr>
                ) : (
                  asistencias.map((asistencia) => (
                    <tr key={asistencia.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold">{asistencia.apellido}, {asistencia.nombre}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                        {asistencia.fecha}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono">{asistencia.horaIngreso || "-"}</span>
                        {asistencia.marcadoPor === "admin" && (
                          <span className="ml-2 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-600" title="Manual">
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-muted-foreground">
                        {asistencia.horaEgreso || "-"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {asistencia.horaIngreso && asistencia.horaEgreso ? (
                          <span className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-700">
                            Completo
                          </span>
                        ) : asistencia.horaIngreso ? (
                          <span className="inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                            En curso
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => openManualMark(asistencia.empleadoId)}
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                        >
                          <PlusCircle className="w-3 h-3 mr-2" /> Marcar
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

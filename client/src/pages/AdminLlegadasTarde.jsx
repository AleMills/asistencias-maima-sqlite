import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Download, Clock, Filter, Loader2, AlertCircle } from "lucide-react";

const AdminLlegadasTarde = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    tolerancia: 0,
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      params.append("tolerancia", filters.tolerancia);

      const res = await api.get(`/asistencias/llegadas-tarde?${params.toString()}`);
      setRecords(res.data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/asistencias/llegadas-tarde/export", {
        params: filters,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `llegadas_tarde_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
       console.error("Error al exportar:", error);
       alert("Error al exportar archivo.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Reporte de Puntualidad</h1>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow transition-all active:scale-95"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-1 mb-8">
          <h2 className="text-3xl font-bold tracking-tighter">Llegadas Tarde</h2>
          <p className="text-sm text-muted-foreground">
            Analiza las demoras del personal basadas en sus horarios pactados.
          </p>
        </div>

        {/* Filters Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm mb-8">
          <div className="p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Desde</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hasta</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tolerancia (min)</label>
                <input
                  type="number"
                  min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={filters.tolerancia}
                  onChange={(e) => setFilters({ ...filters, tolerancia: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Search className="w-4 h-4 mr-2" /> Aplicar Filtros
              </button>
            </form>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_th]:tracking-tighter [&_th]:text-[10px]">
                  <th>Empleado</th>
                  <th>Fecha</th>
                  <th>Ingreso Real</th>
                  <th>Horario Pactado</th>
                  <th className="text-right">Demora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </td>
                    </tr>
                ) : records.length > 0 ? (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold">{record.apellido}, {record.name || record.nombre}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground text-xs">
                        {record.fecha}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-sm">
                        {record.horaIngreso}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {record.horarioEntrada}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200 shadow-sm">
                          +{record.diferenciaMinutos} min
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p className="italic text-sm">No se encontraron demoras bajo este criterio.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLlegadasTarde;

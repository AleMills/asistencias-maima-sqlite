import { useState, useEffect } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Download } from "lucide-react";

const AdminLlegadasTarde = () => {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    tolerancia: 0,
  });

  const fetchRecords = async () => {
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
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      params.append("tolerancia", filters.tolerancia);

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to="/admin/dashboard"
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Reporte de Llegadas Tarde
            </h1>
          </div>
          <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tolerancia (minutos)
              </label>
              <input
                type="number"
                min="0"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={filters.tolerancia}
                onChange={(e) => setFilters({ ...filters, tolerancia: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Search className="w-4 h-4 mr-2" />
              Filtrar
            </button>
          </form>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  Hora Ingreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario Pactado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demora (min)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.apellido}, {record.name || record.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.fecha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.horaIngreso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.horarioEntrada}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      +{record.diferenciaMinutos} min
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron llegadas tarde con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLlegadasTarde;

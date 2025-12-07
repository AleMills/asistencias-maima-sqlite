import { useState, useEffect } from "react";
import api from "../services/api";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";

const AdminEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    password: "",
    horarioEntrada: "",
    horarioSalida: "",
  });

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const res = await api.get("/empleados");
      setEmpleados(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que desea eliminar este empleado?")) {
      try {
        await api.delete(`/empleados/${id}`);
        fetchEmpleados();
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/empleados/${editingId}`, formData);
      } else {
        await api.post("/empleados", formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        dni: "",
        password: "",
      });
      fetchEmpleados();
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setFormData({
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      dni: emp.dni,
      password: "", // Don't show hash
      horarioEntrada: emp.horarioEntrada || "",
      horarioSalida: emp.horarioSalida || "",
    });
    setIsModalOpen(true);
  };

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportEmpleadoId, setExportEmpleadoId] = useState(null);
  const [exportDates, setExportDates] = useState({ from: "", to: "" });

  const handleExportClick = (empId) => {
    setExportEmpleadoId(empId);
    setExportDates({ from: "", to: "" });
    setExportModalOpen(true);
  };

  const confirmExport = async () => {
    try {
      const response = await api.get("/asistencias/export", {
        params: {
          empleadoId: exportEmpleadoId,
          from: exportDates.from,
          to: exportDates.to,
        },
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `asistencias_empleado.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      setExportModalOpen(false);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar asistencias.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Empleados
          </h1>
          <div className="space-x-4">
            <Link
              to="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Volver al Dashboard
            </Link>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  nombre: "",
                  apellido: "",
                  email: "",
                  dni: "",
                  password: "",
                  horarioEntrada: "",
                  horarioSalida: "",
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Empleado
            </button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empleados.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emp.apellido}, {emp.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.horarioEntrada ? `${emp.horarioEntrada} - ${emp.horarioSalida}` : "Sin definir"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleExportClick(emp.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Exportar Asistencias"
                    >
                       Exportar
                    </button>
                    <button
                      onClick={() => openEdit(emp)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingId ? "Editar Empleado" : "Nuevo Empleado"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Entrada (HH:MM)
                    </label>
                    <input
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      value={formData.horarioEntrada || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, horarioEntrada: e.target.value })
                      }
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Salida (HH:MM)
                    </label>
                    <input
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      value={formData.horarioSalida || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, horarioSalida: e.target.value })
                      }
                    />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DNI
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña {editingId && "(Dejar en blanco para no cambiar)"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {exportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Exportar Asistencias</h3>
              <button onClick={() => setExportModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Desde</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    value={exportDates.from}
                    onChange={(e) => setExportDates({...exportDates, from: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Hasta</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    value={exportDates.to}
                    onChange={(e) => setExportDates({...exportDates, to: e.target.value})}
                  />
               </div>
               <button
                  onClick={confirmExport}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
               >
                  Descargar Excel
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmpleados;

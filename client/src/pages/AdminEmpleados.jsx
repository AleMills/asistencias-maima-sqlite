import { useState, useEffect } from "react";
import api from "../services/api";
import { Plus, Edit, Trash2, X, Users, ArrowLeft, Download, Loader2, Check, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const AdminEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
        horarioEntrada: "",
        horarioSalida: "",
      });
      fetchEmpleados();
    } catch (error) {
      alert(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setFormData({
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      dni: emp.dni,
      password: "",
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
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Gestión de Personal</h1>
              </div>
            </div>
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Nuevo Empleado
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-muted-foreground [&_th]:uppercase [&_th]:tracking-tighter [&_th]:text-[10px]">
                  <th>Empleado</th>
                  <th>DNI / Email</th>
                  <th>Horario Laboral</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {empleados.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center text-muted-foreground italic">
                      No hay empleados registrados.
                    </td>
                  </tr>
                ) : (
                  empleados.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold">{emp.apellido}, {emp.nombre}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs text-muted-foreground">{emp.dni}</div>
                        <div className="text-[11px] text-muted-foreground/70">{emp.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {emp.horarioEntrada ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {emp.horarioEntrada} - {emp.horarioSalida}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No definido</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleExportClick(emp.id)}
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                          title="Exportar Asistencias"
                        >
                          <Download className="w-3.5 h-3.5 mr-2" /> Reporte
                        </button>
                        <button
                          onClick={() => openEdit(emp)}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {editingId ? "Editar Empleado" : "Registrar Nuevo Empleado"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="rounded-sm opacity-70 hover:opacity-100 transition-opacity">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">Complete la información del personal.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium leading-none">Nombre</label>
                  <input
                    type="text"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium leading-none">Apellido</label>
                  <input
                    type="text"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-medium leading-none text-muted-foreground italic">Entrada (HH:MM)</label>
                    <input
                      type="time"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={formData.horarioEntrada || ""}
                      onChange={(e) => setFormData({ ...formData, horarioEntrada: e.target.value })}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-medium leading-none text-muted-foreground italic">Salida (HH:MM)</label>
                    <input
                      type="time"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={formData.horarioSalida || ""}
                      onChange={(e) => setFormData({ ...formData, horarioSalida: e.target.value })}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium leading-none">Email Institucional</label>
                <input
                  type="email"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium leading-none">DNI de Identidad</label>
                <input
                  type="text"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium leading-none">
                  Contraseña de Acceso {editingId && <span className="text-[10px] text-muted-foreground ml-1">(Opcional: solo para cambiar)</span>}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  placeholder={editingId ? "••••••••" : ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Check className="w-3 h-3 mr-2" />}
                  {editingId ? "Actualizar" : "Crear Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setExportModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden text-center">
            <div className="p-6 space-y-4">
              <div className="mx-auto bg-muted p-3 rounded-full w-fit">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">Exportar Reporte</h3>
                <p className="text-xs text-muted-foreground">Elija el rango de fechas para el Excel.</p>
              </div>
              
              <div className="text-left space-y-3 pt-2">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Desde</label>
                    <input
                      type="date"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={exportDates.from}
                      onChange={(e) => setExportDates({...exportDates, from: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Hasta</label>
                    <input
                      type="date"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={exportDates.to}
                      onChange={(e) => setExportDates({...exportDates, to: e.target.value})}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                    onClick={confirmExport}
                    className="inline-flex items-center justify-center rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow"
                >
                    Descargar Excel
                </button>
                <button
                    onClick={() => setExportModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2"
                >
                    Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmpleados;

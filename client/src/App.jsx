import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginEmpleado from "./pages/LoginEmpleado";
import LoginAdmin from "./pages/LoginAdmin";
import MarcarAsistencia from "./pages/MarcarAsistencia";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmpleados from "./pages/AdminEmpleados";
import AdminQR from "./pages/AdminQR";
import AdminLlegadasTarde from "./pages/AdminLlegadasTarde";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginEmpleado />} />
          <Route path="/admin/login" element={<LoginAdmin />} />

          {/* Employee Routes */}
          <Route element={<ProtectedRoute role="empleado" />}>
            <Route path="/marcar" element={<MarcarAsistencia />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/empleados" element={<AdminEmpleados />} />
            <Route path="/admin/qr" element={<AdminQR />} />
            <Route path="/admin/llegadas-tarde" element={<AdminLlegadasTarde />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

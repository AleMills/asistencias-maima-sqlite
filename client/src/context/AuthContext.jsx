import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check both storages for existing tokens
    const employeeToken = localStorage.getItem("token");
    const adminToken = sessionStorage.getItem("adminToken");
    const token = adminToken || employeeToken;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const loginEmpleado = async (identifier, password) => {
    const res = await api.post("/auth/empleado/login", {
      identifier,
      password,
    });
    // Employees: persistent storage
    localStorage.setItem("token", res.data.token);
    setUser(jwtDecode(res.data.token));
    return res.data;
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post("/auth/admin/login", { email, password });
    // Admins: session storage (cleared on tab/browser close)
    sessionStorage.setItem("adminToken", res.data.token);
    setUser(jwtDecode(res.data.token));
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("adminToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loginEmpleado, loginAdmin, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

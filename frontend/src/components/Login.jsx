import { useState } from "react";
import axios from "axios";

// Elimino solo "tasks/" para evitar la doble barra en la URL de auth
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("tasks/", "") ||
  "http://127.0.0.1:8000/api/";

export default function Login({ onLogin, goToRegister }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Solicito el par de tokens JWT al backend
      const res = await axios.post(`${BASE_URL}auth/login/`, formData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      onLogin(res.data.access);
    } catch {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-black tracking-tighter italic mb-2">
          TASKFLOW <span className="text-blue-600 font-light">PRO</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Inicia sesión para continuar
        </p>

        {/* Muestro el error solo si existe */}
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder="Usuario"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="password"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
          >
            INICIAR SESIÓN
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          ¿No tienes cuenta?{" "}
          <button
            onClick={goToRegister}
            className="text-blue-600 font-bold hover:underline"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}

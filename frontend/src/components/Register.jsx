import { useState } from "react";
import axios from "axios";
import { Globe, Eye, EyeOff } from "lucide-react";
import translations from "../i18n";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("tasks/", "") ||
  "http://127.0.0.1:8000/api/";

export default function Register({ onRegister, goToLogin, lang, toggleLang }) {
  const t = translations[lang];
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // controla si las contraseñas se ven o se ocultan
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // validaciones antes de llamar al backend
    if (formData.password.length < 8) {
      setError(t.register_error_length);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.register_error_match);
      return;
    }

    try {
      await axios.post(`${BASE_URL}auth/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // mensaje breve de éxito antes de redirigir
      setSuccess(t.register_success);

      // login automático después del registro
      const res = await axios.post(`${BASE_URL}auth/login/`, {
        username: formData.username,
        password: formData.password,
      });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      onRegister(res.data.access);
    } catch (err) {
      setError(err.response?.data?.username?.[0] || t.register_error_generic);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        {/* logo y botón de idioma en la misma fila */}
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-black tracking-tighter italic">
            TASKFLOW <span className="text-blue-600 font-light">PRO</span>
          </h1>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
          >
            <Globe size={14} />
            {lang === "es" ? "ES" : "EN"}
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-8">{t.register_subtitle}</p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        {success && (
          <p className="text-emerald-600 text-sm mb-4 bg-emerald-50 p-3 rounded-xl font-bold">
            {success}
          </p>
        )}

        <div className="space-y-4">
          <input
            autoComplete="off"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder={t.register_username}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="email"
            autoComplete="off"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder={t.register_email}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          {/* campo contraseña con botón de ojo */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="w-full bg-slate-50 p-4 pr-12 rounded-2xl outline-none text-sm font-medium"
              placeholder={t.register_password}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* campo confirmar contraseña con botón de ojo — no se manda al backend */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              className="w-full bg-slate-50 p-4 pr-12 rounded-2xl outline-none text-sm font-medium"
              placeholder={t.register_confirm_password}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
          >
            {t.register_button}
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          {t.register_has_account}{" "}
          <button
            onClick={goToLogin}
            className="text-blue-600 font-bold hover:underline"
          >
            {t.register_login_link}
          </button>
        </p>
      </div>

      {/* footer */}
      <footer className="text-center text-xs mt-6 pb-4 text-slate-400">
        Made by <span className="font-bold">Carlos Padrón</span>
      </footer>
    </div>
  );
}

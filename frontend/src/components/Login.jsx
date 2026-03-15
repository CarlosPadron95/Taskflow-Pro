import { useState } from "react";
import axios from "axios";
import { Globe } from "lucide-react";
import translations from "../i18n";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("tasks/", "") ||
  "http://127.0.0.1:8000/api/";

export default function Login({ onLogin, goToRegister, lang, toggleLang }) {
  const t = translations[lang];
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}auth/login/`, formData);

      // localStorage persiste al cerrar el navegador, sessionStorage no
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("access", res.data.access);
      storage.setItem("refresh", res.data.refresh);

      onLogin(res.data.access);
    } catch {
      setError(t.login_error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
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

        <p className="text-slate-400 text-sm mb-8">{t.login_subtitle}</p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder={t.login_username}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="password"
            className="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-medium"
            placeholder={t.login_password}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          {/* checkbox personalizado porque el nativo es muy feo */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                rememberMe
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-slate-300"
              }`}
            >
              {rememberMe && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-slate-500 font-medium">
              {t.login_remember}
            </span>
          </label>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
          >
            {t.login_button}
          </button>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          {t.login_no_account}{" "}
          <button
            onClick={goToRegister}
            className="text-blue-600 font-bold hover:underline"
          >
            {t.login_register_link}
          </button>
        </p>
      </div>
    </div>
  );
}

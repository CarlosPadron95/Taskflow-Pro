import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sun,
  Moon,
  Plus,
  Search,
  Calendar,
  Clock,
  LogOut,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
  Globe,
} from "lucide-react";
import "./index.css";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskCard from "./components/TaskCard";
import translations from "./i18n";

// saca el user_id del token JWT sin llamar al backend
const getUsernameFromToken = (tkn) => {
  try {
    return JSON.parse(atob(tkn.split(".")[1])).user_id;
  } catch {
    return "default";
  }
};

const getDisplayNameFromToken = (tkn) => {
  try {
    return JSON.parse(atob(tkn.split(".")[1])).username;
  } catch {
    return "Usuario";
  }
};

// toast que se cierra solo a los 3 segundos
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm ${
        type === "success"
          ? "bg-emerald-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      <CheckCircle2 size={18} />
      {message}
    </motion.div>
  );
}

// tarjeta de carga animada mientras llegan las tareas del backend
function SkeletonCard({ darkMode }) {
  return (
    <div
      className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} border-l-[6px] border-l-slate-200 rounded-4xl p-6 shadow-sm border animate-pulse`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`w-7 h-7 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
        />
        <div className="flex-1 space-y-3">
          <div
            className={`h-4 rounded-full w-2/3 ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
          />
          <div
            className={`h-3 rounded-full w-1/2 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
          />
          <div
            className={`h-3 rounded-full w-1/3 ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("access") || sessionStorage.getItem("access") || "",
  );
  const [showRegister, setShowRegister] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [titleError, setTitleError] = useState("");

  // idioma guardado en localStorage para que no se pierda al recargar
  const [lang, setLang] = useState(localStorage.getItem("lang") || "es");
  const t = translations[lang];

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  const userMenuRef = useRef(null);
  const prevDoneRef = useRef(0);

  // este estado no se usa directamente, solo sirve para forzar un re-render cada minuto
  // y que las tarjetas recalculen si están vencidas
  const [, setTick] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    due_date: "",
    due_time: "",
    category: "General",
  });

  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/tasks/";
  const AUTH_URL = API_URL.replace("/tasks/", "/auth/");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchTasks = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    axios
      .get(`${API_URL}?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTasks(res.data.sort((a, b) => b.id - a.id)))
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // cargo el darkMode guardado para este usuario concreto
  useEffect(() => {
    if (!token) return;
    const username = getUsernameFromToken(token);
    const savedDark = localStorage.getItem(`darkMode_${username}`) === "true";
    setDarkMode(savedDark);
  }, [token]);

  // cierra el menú de usuario si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // confeti cuando se completan todas las tareas
  useEffect(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "Completed").length;
    if (total > 0 && done === total && prevDoneRef.current < total) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });
    }
    prevDoneRef.current = done;
  }, [tasks]);

  // re-render cada minuto para actualizar el estado overdue de las tarjetas
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // interceptor de axios para renovar el token automáticamente cuando expira
  // si el refresh también falla hace logout directo
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        // _retry evita que entre en bucle infinito si el refresh también da 401
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          const refresh =
            localStorage.getItem("refresh") ||
            sessionStorage.getItem("refresh");
          if (refresh) {
            try {
              const { data } = await axios.post(`${AUTH_URL}refresh/`, {
                refresh,
              });
              const newAccess = data.access;
              if (localStorage.getItem("refresh")) {
                localStorage.setItem("access", newAccess);
              } else {
                sessionStorage.setItem("access", newAccess);
              }
              setToken(newAccess);
              original.headers["Authorization"] = `Bearer ${newAccess}`;
              return axios(original);
            } catch {
              setTasks([]);
              setToken("");
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              sessionStorage.removeItem("access");
              sessionStorage.removeItem("refresh");
            }
          }
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [AUTH_URL]);

  if (!token) {
    return showRegister ? (
      <Register
        onRegister={setToken}
        goToLogin={() => setShowRegister(false)}
        lang={lang}
        toggleLang={toggleLang}
      />
    ) : (
      <Login
        onLogin={setToken}
        goToRegister={() => setShowRegister(true)}
        lang={lang}
        toggleLang={toggleLang}
      />
    );
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    progress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Completed").length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // el título es obligatorio
    if (!formData.title.trim()) {
      setTitleError(t.form_title_error);
      return;
    }
    setTitleError("");

    const dataToSend = {
      ...formData,
      due_date: formData.due_date || null,
      due_time: formData.due_time || null,
    };
    try {
      await axios.post(API_URL, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        due_date: "",
        due_time: "",
        category: "General",
      });
      fetchTasks();
      showToast(t.toast_created);
    } catch (err) {
      console.error("Error al guardar la tarea:", err.response?.data);
      showToast(t.toast_error, "error");
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    setConfirmDeleteId(null);
    axios.delete(`${API_URL}${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showToast(t.toast_deleted, "error");
  };

  // borra todas las tareas en paralelo para que sea más rápido
  const clearAllTasks = async () => {
    await Promise.all(
      tasks.map((task) =>
        axios.delete(`${API_URL}${task.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    );
    setTasks([]);
    setShowClearAllModal(false);
    showToast(t.toast_all_deleted, "error");
  };

  const updateTask = (id, field, value) => {
    // si se borra la fecha o la hora mando null en vez de string vacío
    const finalValue =
      (field === "due_date" || field === "due_time") && !value ? null : value;
    axios
      .patch(
        `${API_URL}${id}/`,
        { [field]: finalValue },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() => {
        setTasks(
          tasks.map((task) =>
            task.id === id ? { ...task, [field]: value } : task,
          ),
        );
        // al marcar completada muestra mensaje, al desmarcar no muestra nada
        if (field === "status" && value === "Completed") {
          showToast(t.toast_completed);
        } else if (field === "status" && value === "Pending") {
          // no mostramos toast al desmarcar
        } else {
          showToast(t.toast_saved);
        }
      });
  };

  const saveEditing = () => {
    if (!editingField) return;
    const original =
      tasks.find((task) => task.id === editingField.id)?.[editingField.field] ||
      "";
    if (editingValue.trim() !== original) {
      updateTask(editingField.id, editingField.field, editingValue.trim());
    }
    setEditingField(null);
    setEditingValue("");
  };

  const cancelEditing = (e) => {
    if (e.key === "Escape") {
      setEditingField(null);
      setEditingValue("");
    }
    if (e.key === "Enter" && editingField?.field === "title") saveEditing();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterPriority("All");
    setFilterStatus("All");
    setFilterCategory("All");
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      filterPriority === "All" || task.priority === filterPriority;
    const matchesStatus =
      filterStatus === "All" || task.status === filterStatus;
    const matchesCategory =
      filterCategory === "All" || task.category === filterCategory;
    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  // ordenación — sin fecha siempre al final, sin hora al final del mismo día
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const statusOrder = { Pending: 0, "In Progress": 1, Completed: 2 };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "date") {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      if (dateA - dateB !== 0) return dateA - dateB;
      if (!a.due_time && !b.due_time) return 0;
      if (!a.due_time) return 1;
      if (!b.due_time) return -1;
      return a.due_time.localeCompare(b.due_time);
    }
    if (sortBy === "priority")
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === "status")
      return statusOrder[a.status] - statusOrder[b.status];
    return 0;
  });

  // solo se usan en el formulario, las tarjetas tienen sus propias funciones
  const getPriorityText = (p) => {
    if (p === "High") return "text-red-600";
    if (p === "Medium") return "text-orange-500";
    if (p === "Low") return "text-emerald-600";
    return "text-slate-500";
  };

  const getStatusText = (s) => {
    if (s === "Pending") return "text-red-700";
    if (s === "In Progress") return "text-orange-700";
    if (s === "Completed") return "text-emerald-700";
    return "text-slate-700";
  };

  const displayName = getDisplayNameFromToken(token);
  const avatarLetter = displayName?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} p-6 md:p-12 font-sans`}
    >
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <header className="mb-8 flex justify-between items-center border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-black tracking-tighter italic">
            TASKFLOW <span className="text-blue-600 font-light">PRO</span>
          </h1>
          <div className="flex items-center gap-3">
            {/* botón de idioma — también se pasa a Login y Register */}
            <button
              onClick={toggleLang}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 ${
                darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              } shadow-sm`}
            >
              <Globe size={14} />
              {lang === "es" ? "ES" : "EN"}
            </button>

            {/* menú de usuario */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
              >
                {avatarLetter}
              </button>
              {userMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border z-50 overflow-hidden ${darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}
                >
                  <div
                    className={`px-4 py-3 border-b ${darkMode ? "border-slate-700" : "border-slate-100"}`}
                  >
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                      {t.logged_in_as}
                    </p>
                    <p className="text-sm font-black mt-0.5 truncate">
                      {displayName}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !darkMode;
                      localStorage.setItem(
                        `darkMode_${getUsernameFromToken(token)}`,
                        next,
                      );
                      setDarkMode(next);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${darkMode ? "hover:bg-slate-800 text-yellow-400" : "hover:bg-slate-50 text-slate-600"}`}
                  >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    {darkMode ? t.light_mode : t.dark_mode}
                  </button>
                  <button
                    onClick={() => {
                      setTasks([]);
                      setToken("");
                      setUserMenuOpen(false);
                      localStorage.removeItem("access");
                      localStorage.removeItem("refresh");
                      sessionStorage.removeItem("access");
                      sessionStorage.removeItem("refresh");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: t.stat_total, v: stats.total, c: "text-blue-500" },
            { label: t.stat_pending, v: stats.pending, c: "text-red-500" },
            { label: t.stat_active, v: stats.progress, c: "text-orange-500" },
            { label: t.stat_done, v: stats.done, c: "text-emerald-500" },
          ].map((s, i) => (
            <div
              key={i}
              className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} p-5 rounded-4xl border shadow-sm text-center`}
            >
              <p className={`text-3xl font-black ${s.c}`}>{s.v}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* formulario para añadir tareas */}
        <form
          onSubmit={handleSubmit}
          className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-8 rounded-[2.5rem] mb-8 shadow-xl border`}
        >
          <div className="grid grid-cols-1 gap-5">
            <div>
              {/* borde rojo si intentas guardar sin título */}
              <input
                className={`w-full ${darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"} border-none p-5 rounded-2xl outline-none text-xl font-bold placeholder:text-slate-400 ${titleError ? "ring-2 ring-red-400" : ""}`}
                placeholder={t.form_title_placeholder}
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (titleError) setTitleError("");
                }}
              />
              {titleError && (
                <p className="text-red-500 text-xs font-bold mt-2 ml-1">
                  {titleError}
                </p>
              )}
            </div>

            <textarea
              className={`${darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"} border-none p-5 rounded-2xl outline-none text-sm font-medium h-24 placeholder:text-slate-400 resize-none`}
              placeholder={t.form_desc_placeholder}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            {/* móvil: fila 1 → etiqueta + prioridad */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none`}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="General">🏷️ {t.tag_general}</option>
                <option value="Work">💼 {t.tag_work}</option>
                <option value="Home">🏠 {t.tag_home}</option>
                <option value="Urgent">🔥 {t.tag_urgent}</option>
              </select>
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none ${getPriorityText(formData.priority)}`}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="High">{t.priority_high}</option>
                <option value="Medium">{t.priority_medium}</option>
                <option value="Low">{t.priority_low}</option>
              </select>
            </div>

            {/* móvil: fila 2 → estado + fecha + hora
                input invisible encima del div para que iOS pueda abrir el selector nativo */}
            <div className="grid grid-cols-3 gap-3 sm:hidden">
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none ${getStatusText(formData.status)}`}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Pending">{t.status_pending}</option>
                <option value="In Progress">{t.status_in_progress}</option>
                <option value="Completed">{t.status_completed}</option>
              </select>

              {/* fecha móvil */}
              <div
                className={`relative ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"} p-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer`}
              >
                <Calendar size={16} className="shrink-0" />
                <span className="truncate">{formData.due_date || ""}</span>
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>

              {/* hora móvil — deshabilitada si no hay fecha */}
              <div
                title={!formData.due_date ? t.form_add_date_first : ""}
                className={`relative p-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-opacity ${
                  formData.due_date
                    ? `cursor-pointer ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`
                    : "cursor-not-allowed opacity-40 " +
                      (darkMode
                        ? "bg-slate-800 text-slate-500"
                        : "bg-slate-100 text-slate-400")
                }`}
              >
                <Clock size={16} className="shrink-0" />
                <span className="truncate">{formData.due_time || ""}</span>
                <input
                  type="time"
                  disabled={!formData.due_date}
                  className="absolute inset-0 w-full h-full opacity-0 disabled:cursor-not-allowed cursor-pointer"
                  value={formData.due_time}
                  onChange={(e) =>
                    setFormData({ ...formData, due_time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* pc: 3 columnas — etiqueta, prioridad, estado */}
            <div className="hidden sm:grid grid-cols-3 gap-3">
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none`}
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="General">🏷️ {t.tag_general}</option>
                <option value="Work">💼 {t.tag_work}</option>
                <option value="Home">🏠 {t.tag_home}</option>
                <option value="Urgent">🔥 {t.tag_urgent}</option>
              </select>
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none ${getPriorityText(formData.priority)}`}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="High">{t.priority_high}</option>
                <option value="Medium">{t.priority_medium}</option>
                <option value="Low">{t.priority_low}</option>
              </select>
              <select
                className={`${darkMode ? "bg-slate-800" : "bg-slate-100"} p-4 rounded-2xl text-xs font-bold outline-none ${getStatusText(formData.status)}`}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Pending">{t.status_pending}</option>
                <option value="In Progress">{t.status_in_progress}</option>
                <option value="Completed">{t.status_completed}</option>
              </select>
            </div>

            {/* pc: fecha y hora con texto
                input invisible encima del div para que iOS pueda abrir el selector nativo */}
            <div className="hidden sm:flex justify-center gap-3">
              {/* fecha pc */}
              <div
                className={`relative ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"} p-4 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer`}
              >
                <Calendar size={14} className="shrink-0" />
                <span className="shrink-0">{t.form_date}</span>
                <span>{formData.due_date || ""}</span>
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
              </div>

              {/* hora pc — deshabilitada si no hay fecha */}
              <div
                title={!formData.due_date ? t.form_add_date_first : ""}
                className={`relative p-4 rounded-2xl text-xs font-bold flex items-center gap-2 transition-opacity ${
                  formData.due_date
                    ? `cursor-pointer ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`
                    : "cursor-not-allowed opacity-40 " +
                      (darkMode
                        ? "bg-slate-800 text-slate-500"
                        : "bg-slate-100 text-slate-400")
                }`}
              >
                <Clock size={14} className="shrink-0" />
                <span className="shrink-0">{t.form_time}</span>
                <span>{formData.due_time || ""}</span>
                <input
                  type="time"
                  disabled={!formData.due_date}
                  className="absolute inset-0 w-full h-full opacity-0 disabled:cursor-not-allowed cursor-pointer"
                  value={formData.due_time}
                  onChange={(e) =>
                    setFormData({ ...formData, due_time: e.target.value })
                  }
                />
              </div>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95">
              <Plus size={20} /> {t.form_add_button}
            </button>
          </div>
        </form>

        {/* pc: buscador + filtros + sort + borrar todo en una línea */}
        <div className="hidden sm:flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <input
              className={`w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-4 px-12 rounded-2xl outline-none shadow-sm text-sm`}
              placeholder={t.search_placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-4 text-slate-400"
              size={20}
            />
          </div>
          {[
            {
              value: filterPriority,
              setter: setFilterPriority,
              options: [
                ["All", t.priority_all],
                ["High", t.priority_high],
                ["Medium", t.priority_medium],
                ["Low", t.priority_low],
              ],
            },
            {
              value: filterStatus,
              setter: setFilterStatus,
              options: [
                ["All", t.status_all],
                ["Pending", t.status_pending],
                ["In Progress", t.status_in_progress],
                ["Completed", t.status_completed],
              ],
            },
            {
              value: filterCategory,
              setter: setFilterCategory,
              options: [
                ["All", t.tag_all],
                ["General", t.tag_general],
                ["Work", t.tag_work],
                ["Home", t.tag_home],
                ["Urgent", t.tag_urgent],
              ],
            },
          ].map((f, i) => (
            <select
              key={i}
              className={`${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm`}
              value={f.value}
              onChange={(e) => f.setter(e.target.value)}
            >
              {f.options.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          ))}
          <div
            className={`flex items-center gap-2 px-4 py-4 rounded-2xl text-xs font-black ${darkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-600"} shadow-sm`}
          >
            <ArrowUpDown size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-xs font-black cursor-pointer"
            >
              <option value="default">{t.sort_default}</option>
              <option value="date">{t.sort_date}</option>
              <option value="priority">{t.sort_priority}</option>
              <option value="status">{t.sort_status}</option>
            </select>
          </div>
          {tasks.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className={`flex items-center gap-2 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${
                darkMode
                  ? "bg-slate-800 text-red-400 hover:bg-red-900/40"
                  : "bg-red-50 text-red-500 hover:bg-red-100"
              }`}
            >
              <Trash2 size={14} />
              {t.clear_all}
            </button>
          )}
        </div>

        {/* móvil: buscador solo */}
        <div className="sm:hidden mb-3">
          <div className="relative">
            <input
              className={`w-full ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} p-4 px-12 rounded-2xl outline-none shadow-sm text-sm`}
              placeholder={t.search_placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-4 top-4 text-slate-400"
              size={20}
            />
          </div>
        </div>

        {/* móvil: fila 1 → prioridad + estado */}
        <div className="sm:hidden flex gap-2 mb-3">
          <select
            className={`flex-1 ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm`}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">{t.priority_all}</option>
            <option value="High">{t.priority_high}</option>
            <option value="Medium">{t.priority_medium}</option>
            <option value="Low">{t.priority_low}</option>
          </select>
          <select
            className={`flex-1 ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">{t.status_all}</option>
            <option value="Pending">{t.status_pending}</option>
            <option value="In Progress">{t.status_in_progress}</option>
            <option value="Completed">{t.status_completed}</option>
          </select>
        </div>

        {/* móvil: fila 2 → etiqueta + sort */}
        <div className="sm:hidden flex gap-2 mb-8">
          <select
            className={`flex-1 ${darkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-500"} p-4 rounded-2xl text-xs font-bold outline-none shadow-sm`}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">{t.tag_all}</option>
            <option value="General">{t.tag_general}</option>
            <option value="Work">{t.tag_work}</option>
            <option value="Home">{t.tag_home}</option>
            <option value="Urgent">{t.tag_urgent}</option>
          </select>
          <div
            className={`flex items-center gap-2 px-4 rounded-2xl text-xs font-black ${darkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-600"} shadow-sm`}
          >
            <ArrowUpDown size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent outline-none text-xs font-black cursor-pointer"
            >
              <option value="default">{t.sort_default}</option>
              <option value="date">{t.sort_date}</option>
              <option value="priority">{t.sort_priority}</option>
              <option value="status">{t.sort_status}</option>
            </select>
          </div>
        </div>

        {/* skeletons mientras carga */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} darkMode={darkMode} />
            ))}
          </div>
        )}

        {/* sin tareas */}
        {!isLoading && tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🚀</p>
            <p
              className={`text-2xl font-black tracking-tight ${darkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              {t.empty_title}
            </p>
            <p
              className={`text-sm mt-2 font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {t.empty_subtitle}
            </p>
          </motion.div>
        )}

        {/* hay tareas pero los filtros no devuelven nada */}
        {!isLoading && tasks.length > 0 && filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🔍</p>
            <p
              className={`text-2xl font-black tracking-tight ${darkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              {t.empty_filters_title}
            </p>
            <p
              className={`text-sm mt-2 mb-6 font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {t.empty_filters_subtitle}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg"
            >
              {t.clear_filters}
            </button>
          </motion.div>
        )}

        {/* borrar todo en móvil — justo encima de la lista */}
        {!isLoading && tasks.length > 0 && (
          <div className="sm:hidden flex justify-end mb-4">
            <button
              onClick={() => setShowClearAllModal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${
                darkMode
                  ? "bg-slate-800 text-red-400 hover:bg-red-900/40"
                  : "bg-red-50 text-red-500 hover:bg-red-100"
              }`}
            >
              <Trash2 size={14} />
              {t.clear_all}
            </button>
          </div>
        )}

        {/* lista de tareas con drag & drop */}
        {!isLoading && (
          <Reorder.Group
            axis="y"
            values={tasks}
            onReorder={setTasks}
            className="space-y-4"
          >
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  darkMode={darkMode}
                  lang={lang}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  confirmDeleteId={confirmDeleteId}
                  setConfirmDeleteId={setConfirmDeleteId}
                  editingField={editingField}
                  editingValue={editingValue}
                  setEditingField={setEditingField}
                  setEditingValue={setEditingValue}
                  saveEditing={saveEditing}
                  cancelEditing={cancelEditing}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>

      {/* footer */}
      <footer
        className={`text-center text-xs mt-12 pb-4 ${darkMode ? "text-slate-600" : "text-slate-400"}`}
      >
        Made by <span className="font-bold">Carlos Padrón</span>
      </footer>

      {/* modal de confirmación para borrar todo
          clic fuera del recuadro lo cierra sin borrar nada */}
      <AnimatePresence>
        {showClearAllModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearAllModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm mx-4 p-8 rounded-4xl shadow-2xl border ${
                darkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-slate-100"
              }`}
            >
              <p className="text-4xl mb-4 text-center">🗑️</p>
              <h2 className="text-xl font-black text-center tracking-tight mb-2">
                {t.modal_title}
              </h2>
              <p
                className={`text-sm text-center mb-8 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {t.modal_body} {tasks.length}{" "}
                {tasks.length === 1
                  ? t.modal_body_singular
                  : t.modal_body_plural}
                {t.modal_body_end}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-black transition-all active:scale-95 ${
                    darkMode
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.modal_cancel}
                </button>
                <button
                  onClick={clearAllTasks}
                  className="flex-1 py-3 rounded-2xl text-sm font-black bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg"
                >
                  {t.modal_confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast de confirmación */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

import { useRef, useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  Calendar,
  Clock,
  GripVertical,
} from "lucide-react";
import translations from "../i18n";

const getPriorityClasses = (p) => {
  if (p === "High")
    return {
      border: "border-l-red-600",
      text: "text-red-600",
      bg: "bg-red-50",
    };
  if (p === "Medium")
    return {
      border: "border-l-orange-400",
      text: "text-orange-500",
      bg: "bg-orange-50",
    };
  if (p === "Low")
    return {
      border: "border-l-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  return {
    border: "border-l-slate-300",
    text: "text-slate-500",
    bg: "bg-slate-50",
  };
};

const getStatusClasses = (s) => {
  if (s === "Pending") return { bg: "bg-red-100", text: "text-red-700" };
  if (s === "In Progress")
    return { bg: "bg-orange-100", text: "text-orange-700" };
  if (s === "Completed")
    return { bg: "bg-emerald-100", text: "text-emerald-700" };
  return { bg: "bg-slate-100", text: "text-slate-700" };
};

// calcula si la tarea está vencida según fecha y hora local
// si tiene hora, mira fecha+hora exacta / si no, cuenta hasta el final del día
const getOverdueState = (task) => {
  if (!task.due_date || task.status === "Completed") {
    return { dateOverdue: false, timeOverdue: false };
  }
  const now = new Date();
  const [year, month, day] = task.due_date.split("-").map(Number);
  if (task.due_time) {
    const [hours, minutes] = task.due_time.split(":").map(Number);
    const deadline = new Date(year, month - 1, day, hours, minutes);
    return { dateOverdue: false, timeOverdue: deadline < now };
  } else {
    const deadlineDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { dateOverdue: deadlineDay < now, timeOverdue: false };
  }
};

export default function TaskCard({
  task,
  darkMode,
  lang,
  updateTask,
  deleteTask,
  confirmDeleteId,
  setConfirmDeleteId,
  editingField,
  editingValue,
  setEditingField,
  setEditingValue,
  saveEditing,
  cancelEditing,
}) {
  const t = translations[lang];
  const prio = getPriorityClasses(task.priority);
  const stat = getStatusClasses(task.status);
  const { dateOverdue, timeOverdue } = getOverdueState(task);
  const isEditingTitle =
    editingField?.id === task.id && editingField?.field === "title";
  const isEditingDesc =
    editingField?.id === task.id && editingField?.field === "description";
  const isPendingDelete = confirmDeleteId === task.id;

  // en móvil el drag solo se activa desde el handle para no interferir con el scroll
  // en pc se puede arrastrar desde cualquier parte de la tarjeta como antes
  const dragControls = useDragControls();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // refs para abrir el datepicker al hacer clic en cualquier parte del recuadro
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const openDatePicker = () => {
    try {
      dateInputRef.current?.showPicker();
    } catch {
      dateInputRef.current?.focus();
    }
  };

  const openTimePicker = () => {
    if (!task.due_date) return;
    try {
      timeInputRef.current?.showPicker();
    } catch {
      timeInputRef.current?.focus();
    }
  };

  const startEditing = (field) => {
    setEditingField({ id: task.id, field });
    setEditingValue(task[field] || "");
  };

  return (
    <Reorder.Item
      key={task.id}
      value={task}
      dragControls={dragControls}
      dragListener={!isMobile}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"} border-l-[6px] ${prio.border} rounded-4xl p-6 shadow-sm border group ${!isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* handle de arrastre — solo visible en móvil (sm:hidden lo oculta en pc)
            onPointerDown inicia el drag al pulsar sobre este icono */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className={`mt-1 shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 rounded-lg opacity-30 group-hover:opacity-70 transition-opacity sm:hidden ${darkMode ? "text-slate-400" : "text-slate-400"}`}
        >
          <GripVertical size={18} />
        </div>

        {/* checkbox — marca como completada o la vuelve a pending */}
        <button
          onClick={() =>
            updateTask(
              task.id,
              "status",
              task.status === "Completed" ? "Pending" : "Completed",
            )
          }
          className={`mt-1 transition-all transform hover:scale-110 shrink-0 ${task.status === "Completed" ? "text-emerald-500" : "text-slate-300"}`}
        >
          {task.status === "Completed" ? (
            <CheckCircle2 size={28} />
          ) : (
            <Circle size={28} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* doble clic para editar el título */}
            {isEditingTitle ? (
              <input
                autoFocus
                className="text-lg font-bold tracking-tight bg-transparent border-b-2 border-blue-500 outline-none w-full"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={saveEditing}
                onKeyDown={cancelEditing}
              />
            ) : (
              <h3
                onDoubleClick={() => startEditing("title")}
                title={t.card_edit_hint}
                className={`text-lg font-bold tracking-tight cursor-text hover:opacity-70 transition-opacity ${task.status === "Completed" ? "line-through text-slate-500 opacity-60" : ""}`}
              >
                {task.title}
              </h3>
            )}

            {/* badges de prioridad, estado y categoría — son selects para poder cambiarlos directamente */}
            <select
              value={task.priority}
              onChange={(e) => updateTask(task.id, "priority", e.target.value)}
              className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border-none outline-none cursor-pointer ${prio.bg} ${prio.text}`}
            >
              <option value="High">{t.badge_high}</option>
              <option value="Medium">{t.badge_medium}</option>
              <option value="Low">{t.badge_low}</option>
            </select>

            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, "status", e.target.value)}
              className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border-none outline-none cursor-pointer ${stat.bg} ${stat.text}`}
            >
              <option value="Pending">{t.badge_pending}</option>
              <option value="In Progress">{t.badge_in_progress}</option>
              <option value="Completed">{t.badge_completed}</option>
            </select>

            <div
              className={`flex items-center gap-1 ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"} px-2.5 py-1 rounded-full font-bold border ${darkMode ? "border-slate-700" : "border-slate-200"}`}
            >
              <Tag size={10} />
              <select
                value={task.category || "General"}
                onChange={(e) =>
                  updateTask(task.id, "category", e.target.value)
                }
                className="text-[9px] bg-transparent border-none outline-none font-bold uppercase cursor-pointer"
              >
                <option value="General">{t.tag_general}</option>
                <option value="Work">{t.tag_work}</option>
                <option value="Home">{t.tag_home}</option>
                <option value="Urgent">{t.tag_urgent}</option>
              </select>
            </div>
          </div>

          {/* doble clic para editar la descripción */}
          {isEditingDesc ? (
            <textarea
              autoFocus
              className={`text-sm bg-transparent border-b-2 border-blue-500 outline-none w-full resize-none mb-3 ${darkMode ? "text-slate-300" : "text-slate-600"}`}
              rows={2}
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveEditing}
              onKeyDown={cancelEditing}
            />
          ) : (
            <p
              onDoubleClick={() => startEditing("description")}
              title={t.card_edit_hint}
              className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"} leading-relaxed mb-3 cursor-text hover:opacity-70 transition-opacity`}
            >
              {task.description || t.card_no_description}
            </p>
          )}

          {/* fecha y hora en columna en móvil para evitar que se salgan de la tarjeta */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* el input tiene pointer-events-none para que el clic lo gestione el div */}
            <div
              onClick={openDatePicker}
              className={`flex items-center gap-2 text-[10px] font-bold w-fit px-3 py-1 rounded-lg cursor-pointer ${
                dateOverdue
                  ? "text-red-500 bg-red-50 animate-pulse"
                  : darkMode
                    ? "text-blue-400 bg-blue-900/30"
                    : "text-blue-500 bg-blue-50"
              }`}
            >
              <Calendar size={12} />
              <span className="uppercase tracking-tighter">
                {dateOverdue ? t.card_overdue_date : t.card_deadline}
              </span>
              <input
                ref={dateInputRef}
                type="date"
                value={task.due_date || ""}
                onChange={(e) =>
                  updateTask(task.id, "due_date", e.target.value)
                }
                className="bg-transparent border-none outline-none text-[10px] font-bold pointer-events-none"
              />
            </div>

            {/* la hora se deshabilita si no hay fecha
                max-w-full evita que se salga de la tarjeta en móvil cuando hay overdue */}
            <div
              onClick={openTimePicker}
              title={!task.due_date ? t.form_add_date_first : ""}
              className={`flex items-center gap-2 text-[10px] font-bold w-fit max-w-full px-3 py-1 rounded-lg transition-opacity ${
                !task.due_date
                  ? "opacity-40 cursor-not-allowed"
                  : timeOverdue
                    ? "text-red-500 bg-red-50 animate-pulse cursor-pointer"
                    : darkMode
                      ? "text-purple-400 bg-purple-900/30 cursor-pointer"
                      : "text-purple-500 bg-purple-50 cursor-pointer"
              }`}
            >
              <Clock size={12} className="shrink-0" />
              <span className="uppercase tracking-tighter shrink-0">
                {timeOverdue ? t.card_overdue_time : t.card_time}
              </span>
              <input
                ref={timeInputRef}
                type="time"
                disabled={!task.due_date}
                value={task.due_time || ""}
                onChange={(e) =>
                  updateTask(task.id, "due_time", e.target.value)
                }
                className="bg-transparent border-none outline-none text-[10px] font-bold pointer-events-none disabled:cursor-not-allowed min-w-0"
              />
              {/* botón para borrar la hora, stopPropagation para que no abra el picker */}
              {task.due_time && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTask(task.id, "due_time", "");
                  }}
                  className="ml-1 shrink-0 hover:text-red-500 transition-colors font-black leading-none"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* la papelera se oculta cuando se está esperando confirmación */}
        {!isPendingDelete && (
          <button
            onClick={() => setConfirmDeleteId(task.id)}
            className="shrink-0 p-2 rounded-xl transition-all duration-300 opacity-40 group-hover:opacity-100 flex items-center justify-center hover:scale-125 hover:bg-red-500/20 text-slate-400 hover:text-red-600"
          >
            <Trash2 size={22} />
          </button>
        )}
      </div>

      {/* botones de confirmación fuera del flex principal para que en móvil
          no se salgan de la pantalla */}
      {isPendingDelete && (
        <div className="flex gap-2 mt-4 w-full sm:mt-0 sm:w-auto sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
          <button
            onClick={() => deleteTask(task.id)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-black hover:bg-red-600 transition-all active:scale-95"
          >
            {t.card_delete}
          </button>
          <button
            onClick={() => setConfirmDeleteId(null)}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
              darkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {t.card_cancel}
          </button>
        </div>
      )}
    </Reorder.Item>
  );
}

// traducciones de la app en español e inglés
// para añadir un texto nuevo hay que añadirlo en los dos idiomas
const translations = {
  es: {
    // LOGIN
    login_subtitle: "Inicia sesión para continuar",
    login_error: "Usuario o contraseña incorrectos",
    login_username: "Usuario",
    login_password: "Contraseña",
    login_remember: "Recuérdame",
    login_button: "INICIAR SESIÓN",
    login_no_account: "¿No tienes cuenta?",
    login_register_link: "Regístrate",

    // REGISTER
    register_subtitle: "Crea tu cuenta gratis",
    register_username: "Usuario",
    register_email: "Email",
    register_password: "Contraseña (mínimo 8 caracteres)",
    register_confirm_password: "Repite la contraseña",
    register_button: "CREAR CUENTA",
    register_has_account: "¿Ya tienes cuenta?",
    register_login_link: "Inicia sesión",
    register_error_length: "La contraseña debe tener al menos 8 caracteres.",
    register_error_match: "Las contraseñas no coinciden.",
    register_error_generic: "Error al registrarse",
    register_success: "¡Cuenta creada correctamente! Iniciando sesión...",

    // HEADER
    logged_in_as: "Conectado como",
    light_mode: "Modo claro",
    dark_mode: "Modo oscuro",
    logout: "Cerrar sesión",

    // STATS
    stat_total: "Total",
    stat_pending: "Pendientes",
    stat_active: "Activas",
    stat_done: "Completadas",

    // FILTROS
    search_placeholder: "Buscar...",
    priority_all: "Prioridad: Todas",
    priority_high: "Alta",
    priority_medium: "Media",
    priority_low: "Baja",
    status_all: "Estado: Todos",
    status_pending: "Pendiente",
    status_in_progress: "En progreso",
    status_completed: "Completada",
    tag_all: "Etiqueta: Todas",
    tag_general: "General",
    tag_work: "Trabajo",
    tag_home: "Casa",
    tag_urgent: "Urgente",

    // FORMULARIO
    form_title_placeholder: "Título de la tarea...",
    form_desc_placeholder: "Detalles... (opcional)",
    form_date: "Fecha",
    form_time: "Hora",
    form_add_date_first: "Añade una fecha primero",
    form_add_button: "AÑADIR",
    form_title_error: "El título es obligatorio para guardar la tarea.",

    // ORDENACIÓN Y ACCIONES
    sort_default: "Orden: Por defecto",
    sort_date: "Orden: Fecha",
    sort_priority: "Orden: Prioridad",
    sort_status: "Orden: Estado",
    clear_all: "Borrar todo",

    // TARJETAS
    card_deadline: "Vence:",
    card_time: "Hora:",
    card_overdue: "Vencida",
    card_delete: "Eliminar",
    card_cancel: "Cancelar",
    card_no_description: "Sin descripción.",
    card_edit_hint: "Doble clic para editar",

    // BADGES
    badge_high: "Alta",
    badge_medium: "Media",
    badge_low: "Baja",
    badge_pending: "Pendiente",
    badge_in_progress: "En progreso",
    badge_completed: "Completada",

    // EMPTY STATES
    empty_title: "Sin tareas.",
    empty_subtitle: "¡Vamos a ser productivos! Añade tu primera tarea.",
    empty_filters_title: "Ninguna tarea coincide con los filtros.",
    empty_filters_subtitle: "Prueba a ajustar la búsqueda o los filtros.",
    clear_filters: "Limpiar filtros",

    // MODAL BORRAR TODO
    modal_title: "¿Eliminar todas las tareas?",
    modal_body_singular: "tarea",
    modal_body_plural: "tareas",
    modal_body: "Se eliminarán permanentemente todas las",
    modal_body_end: ". Esta acción no se puede deshacer.",
    modal_confirm: "Eliminar todo",
    modal_cancel: "Cancelar",

    // TOASTS
    toast_created: "Tarea creada ✓",
    toast_saved: "Guardado ✓",
    toast_completed: "Tarea completada ✓",
    toast_deleted: "Tarea eliminada",
    toast_all_deleted: "Todas las tareas eliminadas",
    toast_error: "Error al guardar",
  },

  en: {
    // LOGIN
    login_subtitle: "Sign in to continue",
    login_error: "Incorrect username or password",
    login_username: "Username",
    login_password: "Password",
    login_remember: "Remember me",
    login_button: "SIGN IN",
    login_no_account: "Don't have an account?",
    login_register_link: "Sign up",

    // REGISTER
    register_subtitle: "Create your free account",
    register_username: "Username",
    register_email: "Email",
    register_password: "Password (min. 8 characters)",
    register_confirm_password: "Repeat password",
    register_button: "CREATE ACCOUNT",
    register_has_account: "Already have an account?",
    register_login_link: "Sign in",
    register_error_length: "Password must be at least 8 characters.",
    register_error_match: "Passwords do not match.",
    register_error_generic: "Registration error",
    register_success: "Account created! Signing in...",

    // HEADER
    logged_in_as: "Logged in as",
    light_mode: "Light mode",
    dark_mode: "Dark mode",
    logout: "Logout",

    // STATS
    stat_total: "Total",
    stat_pending: "Pending",
    stat_active: "Active",
    stat_done: "Done",

    // FILTROS
    search_placeholder: "Search...",
    priority_all: "Priority: All",
    priority_high: "High",
    priority_medium: "Medium",
    priority_low: "Low",
    status_all: "Status: All",
    status_pending: "Pending",
    status_in_progress: "In Progress",
    status_completed: "Completed",
    tag_all: "Tag: All",
    tag_general: "General",
    tag_work: "Work",
    tag_home: "Home",
    tag_urgent: "Urgent",

    // FORMULARIO
    form_title_placeholder: "Task title...",
    form_desc_placeholder: "Task details... (optional)",
    form_date: "Date",
    form_time: "Time",
    form_add_date_first: "Add a date first",
    form_add_button: "ADD",
    form_title_error: "Title is required to save a task.",

    // ORDENACIÓN Y ACCIONES
    sort_default: "Sort: Default",
    sort_date: "Sort: Date",
    sort_priority: "Sort: Priority",
    sort_status: "Sort: Status",
    clear_all: "Clear all",

    // TARJETAS
    card_deadline: "Deadline:",
    card_time: "Time:",
    card_overdue: "Overdue",
    card_delete: "Delete",
    card_cancel: "Cancel",
    card_no_description: "No description provided.",
    card_edit_hint: "Double click to edit",

    // BADGES
    badge_high: "High",
    badge_medium: "Medium",
    badge_low: "Low",
    badge_pending: "Pending",
    badge_in_progress: "In Progress",
    badge_completed: "Completed",

    // EMPTY STATES
    empty_title: "No tasks yet.",
    empty_subtitle: "Let's get productive! Add your first task above.",
    empty_filters_title: "No tasks match your filters.",
    empty_filters_subtitle: "Try adjusting your search or filters.",
    clear_filters: "Clear filters",

    // MODAL BORRAR TODO
    modal_title: "Delete all tasks?",
    modal_body_singular: "task",
    modal_body_plural: "tasks",
    modal_body: "This will permanently delete all",
    modal_body_end: ". This action cannot be undone.",
    modal_confirm: "Delete all",
    modal_cancel: "Cancel",

    // TOASTS
    toast_created: "Task created ✓",
    toast_saved: "Saved ✓",
    toast_completed: "Task completed ✓",
    toast_deleted: "Task deleted",
    toast_all_deleted: "All tasks deleted",
    toast_error: "Error saving task",
  },
};

export default translations;

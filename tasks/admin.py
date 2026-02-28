from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # Campos que se verán en la tabla principal (Añadimos 'category')
    list_display = ('title', 'category', 'priority', 'status', 'due_date', 'created_at')
    
    # Filtros laterales (Añadimos 'category' para filtrar por etiquetas en el admin)
    list_filter = ('category', 'priority', 'status', 'due_date')
    
    # Buscador por título
    search_fields = ('title',)
    
    # Permitir editar la categoría directamente desde la lista sin entrar en la tarea
    list_editable = ('category', 'priority', 'status', 'due_date')
from django.db import models
from django.utils import timezone

class Task(models.Model):
    # Opciones para normalizar los datos y facilitar los filtros en el frontend
    PRIORITY_CHOICES = [('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')]
    STATUS_CHOICES = [('Pending', 'Pending'), ('In Progress', 'In Progress'), ('Completed', 'Completed')]
    CATEGORY_CHOICES = [
        ('General', 'General'), ('Work', 'Work'), 
        ('Home', 'Home'), ('Urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Asigno valores por defecto para asegurar la integridad de los datos
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending')
    
    # Permito nulos en la DB para que la fecha de entrega sea opcional
    due_date = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='General')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
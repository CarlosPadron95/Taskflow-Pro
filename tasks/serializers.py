from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        # Defino los campos que expondré en la API para que React pueda consumirlos
        fields = [
            'id', 'title', 'description', 'priority', 
            'status', 'due_date', 'category', 'created_at'
        ]
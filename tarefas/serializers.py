from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from tarefas.models import Tarefas

class TarefasSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        tarefa = Tarefas.objects.create(
            descricao=validated_data['descricao'],
            prazo=validated_data['prazo'],
            status=validated_data['status'],
            time=validated_data['time'],
            responsavel=validated_data['responsavel'],
            criado_por=self.context['request'].user,
        )
        return tarefa
    
    class Meta:
        model = Tarefas
        fields = ['id', 'descricao', 'prazo', 'status', 'time', 'responsavel', 'criado_por']
        read_only_fields = ('criado_por',)
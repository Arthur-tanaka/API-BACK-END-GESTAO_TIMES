from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from tarefas.models import Tarefas
from rest_framework.exceptions import ValidationError
from times.models import Participante

class TarefasSerializer(serializers.ModelSerializer):
    time_nome = serializers.CharField(source='time.descricao', read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.username', read_only=True)

    def validate(self, attrs):
        request = self.context['request']
        time = attrs.get('time', getattr(self.instance, 'time', None))
        responsavel = attrs.get('responsavel', getattr(self.instance, 'responsavel', None))

        if time and not Participante.objects.filter(
            usuario=request.user,
            time=time,
            papel=Participante.Tipo_usuario.GERENTE,
        ).exists():
            raise ValidationError({'time': 'Você precisa ser gerente deste time.'})

        if time and responsavel and not Participante.objects.filter(
            usuario=responsavel,
            time=time,
        ).exists():
            raise ValidationError({'responsavel': 'O responsável precisa participar deste time.'})
        return attrs

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
        fields = ['id', 'descricao', 'prazo', 'status', 'time', 'time_nome', 'responsavel', 'responsavel_nome', 'criado_por']
        read_only_fields = ('criado_por',)

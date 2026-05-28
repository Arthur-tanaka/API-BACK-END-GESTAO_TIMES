from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Time, Participante

class TimeSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        time = Time.objects.create(
            descricao=validated_data['descricao']
        )
        participante = Participante.objects.create(
            usuario = self.context['request'].user,
            time = time,
            papel = Participante.Tipo_usuario.GERENTE,
        )
        return time
        
    class Meta:
        model = Time
        fields = ['id', 'descricao']
        

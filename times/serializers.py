from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Time, Participante

class TimeSerializer(serializers.ModelSerializer):
    meu_papel = serializers.SerializerMethodField()

    def get_meu_papel(self, time):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        participacao = time.participantes.filter(usuario=request.user).first()
        return participacao.papel if participacao else None

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
        fields = ['id', 'descricao', 'meu_papel']
        

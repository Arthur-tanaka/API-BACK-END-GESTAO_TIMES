from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from times.serializers import TimeSerializer
from times.models import Time, Participante
from times.permissions import IsGerenteOrReadOnly
from users.models import User
from rest_framework.decorators import action

class TimeViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Time.objects.filter(participantes__usuario=self.request.user)
    
    @action(methods=['post'], detail=True, permission_classes=[IsGerenteOrReadOnly])
    def adicionar_participante(self, request, pk=None):
        time = Time.objects.get(pk=pk)
        user_body = request.data.get('usuario_id')
        user = User.objects.get(pk=user_body)
        participante = Participante.objects.create(
            usuario=user,
            time=time,
            papel=Participante.Tipo_usuario.MEMBRO
        )
        return Response('Participante adicionado', status=status.HTTP_201_CREATED)
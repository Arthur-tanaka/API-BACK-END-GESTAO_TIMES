from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from times.serializers import TimeSerializer
from times.models import Time, Participante
from times.permissions import IsGerenteOrReadOnly
from users.models import User
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError

class TimeViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSerializer
    permission_classes = [IsGerenteOrReadOnly]

    def get_queryset(self):
        return Time.objects.filter(participantes__usuario=self.request.user)
    
    @action(methods=['post'], detail=True, permission_classes=[IsGerenteOrReadOnly])
    def adicionar_participante(self, request, pk=None):
        time = self.get_object()
        username = request.data.get('username', '').strip()
        if not username:
            raise ValidationError({'username': 'Informe o nome de usuário.'})
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise NotFound('Usuário não encontrado.')
        if Participante.objects.filter(usuario=user, time=time).exists():
            raise ValidationError({'username': 'Este usuário já participa do time.'})
        Participante.objects.create(
            usuario=user,
            time=time,
            papel=Participante.Tipo_usuario.MEMBRO
        )
        return Response({'detail': 'Participante adicionado.'}, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True, permission_classes=[IsAuthenticated])
    def participantes(self, request, pk=None):
        time = self.get_object()
        membros = time.participantes.select_related('usuario').all()
        return Response([
            {
                'id': membro.usuario_id,
                'username': membro.usuario.username,
                'papel': membro.papel,
            }
            for membro in membros
        ])

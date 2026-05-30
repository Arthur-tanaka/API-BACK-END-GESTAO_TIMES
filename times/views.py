from rest_framework import viewsets
from times.serializers import TimeSerializer
from rest_framework.permissions import IsAuthenticated
from times.models import Time
from times.permissions import IsGerenteOrReadOnly

class TimeViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Time.objects.filter(participantes__usuario=self.request.user)
    
    @action(methods=['post'], detail=True, permission_classes=[IsGerenteOrReadOnly])
    def adicionar_participante(self, request, pk=None):
        time = Time.objects.get(pk=pk)
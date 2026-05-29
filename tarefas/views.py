from rest_framework import viewsets
from times.permissions import IsGerenteOrReadOnly
from tarefas.serializers import TarefasSerializer
from tarefas.models import Tarefas

class TarefaViewSet(viewsets.ModelViewSet):
    serializer_class = TarefasSerializer
    permission_classes = [IsGerenteOrReadOnly]
    
    def get_queryset(self):
        return Tarefas.objects.filter(time__participantes__usuario=self.request.user)
    
    
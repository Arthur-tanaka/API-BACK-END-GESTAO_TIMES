from rest_framework import viewsets
from times.serializers import TimeSerializer
from rest_framework.permissions import IsAuthenticated
from times.models import Time

class TimeViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Time.objects.filter(participante__usuario=self.request.user)
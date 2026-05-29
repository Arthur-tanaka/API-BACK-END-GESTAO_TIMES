from times.models import Participante
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsGerenteOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        else:
            return Participante.objects.filter(
                    usuario=request.user,
                    papel=Participante.Tipo_usuario.GERENTE).exists()
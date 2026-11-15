from times.models import Participante
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated

class IsGerenteOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return IsAuthenticated().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        time = getattr(obj, 'time', obj)
        return Participante.objects.filter(
            usuario=request.user,
            time=time,
            papel=Participante.Tipo_usuario.GERENTE,
        ).exists()

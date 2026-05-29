from rest_framework.routers import DefaultRouter
from tarefas.views import TarefaViewSet
from django.urls import path, include

router = DefaultRouter(trailing_slash=False)
router.register(r'tarefas', TarefaViewSet, basename='tarefas')

urlpatterns = [
    path('', include(router.urls))
]
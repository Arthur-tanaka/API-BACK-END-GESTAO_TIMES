from rest_framework.routers import DefaultRouter
from times.views import TimeViewSet
from django.urls import path, include

router = DefaultRouter(trailing_slash=False)
router.register(r'times', TimeViewSet, basename='time')

urlpatterns = [
    path('', include(router.urls))
]
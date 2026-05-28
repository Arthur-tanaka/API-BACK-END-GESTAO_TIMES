from django.db import models
from users.models import User
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Time(models.Model):
    descricao = models.CharField(max_length=100)
    # Relacionamento apontando para a tabela intermediária
    participante = models.ManyToManyField(User, through='Participante')
    
class Participante(models.Model):
    class Tipo_usuario(models.TextChoices):
        GERENTE = 'GR', _("Gerente")
        MEMBRO = 'MB', _("Membro")
    papel = models.CharField(choices=Tipo_usuario, max_length=2, default=Tipo_usuario.MEMBRO)
    # Chaves estrangeiras obrigatórias
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    time = models.ForeignKey(Time, related_name='participantes', on_delete=models.CASCADE)
    # Atributos extras
    data_ativida = models.DateField(auto_now_add=True)
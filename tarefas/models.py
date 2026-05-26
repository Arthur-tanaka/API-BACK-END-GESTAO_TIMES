from django.db import models
from users.models import User
from times.models import Time

class Tarefas(models.Model):
    class Status(models.TextChoices):   
        a_fazer = 'a_fazer'
        desenvolvimento = 'desenvolvimento'
        completo = 'completo'
        analise = 'Analisar'

    descricao = models.TextField()
    prazo = models.DateField()
    status = models.CharField(max_length=20, choices=Status, default=Status.a_fazer)
    criado_por = models.ForeignKey(User, related_name='tarefas_criadas', on_delete=models.CASCADE)
    responsavel = models.ForeignKey(User, related_name='tarefas_responsavel', on_delete=models.CASCADE)
    time = models.ForeignKey(Time, related_name='time', on_delete=models.CASCADE)
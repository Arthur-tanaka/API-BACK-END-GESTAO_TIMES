from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from times.models import Time, Participante

class TestTimes(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Criação de usuario para teste
        self.usuario = User.objects.create_user(
            username='usuario_teste',
            email='teste@exemplo.com',
            password='testesenha'
        )
        self.usuario2 = User.objects.create_user(
            username='gerente_teste',
            email='gerente@exemplo.com',
            password='testesenha',
        )
        # Criação de time para teste
        self.time = Time.objects.create(
            descricao='teste_descricao'
        )
        # Criação de participante para teste
        self.participante = Participante.objects.create(
            usuario = self.usuario,
            time = self.time,
            papel = Participante.Tipo_usuario.MEMBRO,
        )
        self.gerente = Participante.objects.create(
            usuario=self.usuario2,
            time=self.time,
                papel=Participante.Tipo_usuario.GERENTE,
        )
        
    # Teste de usuario não autenticado que não tem permissão para operar o sistema
    def test_usuario_nao_autenticado(self):
        response = self.client.post('/times/times', {
            'descricao':'Descrição teste',
        })
        self.assertEqual(response.status_code, 401) 
        
    # Teste membro autenticado não pode criar tarefas
    def test_membro_autenticado_restringir(self):
        self.client.force_authenticate(user=self.usuario)
        response = self.client.post('/tarefas/tarefas', {
            'status':'a_fazer',
            'descricao':'Descrição_teste_membro_autenticado',
            'time': self.time.id,
            'responsavel': self.usuario.id,
            'prazo':'2027-06-20'
        })
        self.assertEqual(response.status_code, 403)
        
    # Gerente autenticado consegue criar tarefa
    def test_gerente_cria_tarefa(self):
        self.client.force_authenticate(user=self.usuario2)
        response = self.client.post('/tarefas/tarefas', {
            'status':'a_fazer',
            'descricao':'Descrição_teste_gerente_autenticado',
            'time': self.time.id,
            'responsavel': self.usuario.id,
            'prazo':'2027-06-20'
        })
        self.assertEqual(response.status_code, 201)
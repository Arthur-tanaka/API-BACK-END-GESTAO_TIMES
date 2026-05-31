from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from times.models import Time, Participante

class TestTimes(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.usuario = User.objects.create_user(
            username='usuario_teste',
            email='teste@exemplo.com',
            password='testesenha'
        )
        # Criação de time para teste
        self.time = Time.objects.create(
            descricao='teste_descricao'
        )
        self.participante = Participante.objects.create(
            usuario = self.usuario,
            time = self.time,
            papel = Participante.Tipo_usuario.MEMBRO,
        )
    # Teste de usuario não autenticado que não tem permissão para operar o sistema
    def test_usuario_nao_autenticado(self):
        response = self.client.post('/times/times', {
            'descricao':'Descrição teste',
        })
        self.assertEqual(response.status_code, 401)

    
    
    
    
        
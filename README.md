# API de Gestão de Equipes

API REST desenvolvida com Django e Django REST Framework para gerenciamento de times e tarefas, com controle de acesso baseado em papéis (RBAC).

🔗 **Deploy:** [api-back-end-gestao-times.onrender.com](https://api-back-end-gestao-times.onrender.com)

> ⚠️ A aplicação está hospedada no plano gratuito do Render, que hiberna após períodos de inatividade. A primeira requisição pode levar até 50 segundos para responder.

## 📋 Sobre o projeto

O sistema permite que usuários criem times, convidem participantes e gerenciem tarefas, com regras de negócio que diferenciam o que **gerentes** e **membros** podem fazer dentro de um time.

Principais decisões de modelagem:

- O papel do usuário (gerente ou membro) não é um atributo fixo dele, mas sim da sua **participação em um time específico** — um mesmo usuário pode ser gerente em um time e membro em outro.
- Ao criar um time, o criador se torna automaticamente seu gerente.
- Apenas gerentes podem criar, editar e excluir tarefas; membros têm acesso somente leitura.

## 🛠️ Tecnologias

- **Python** / **Django**
- **Django REST Framework**
- **PostgreSQL** (produção) / **SQLite** (desenvolvimento)
- **JWT Authentication** (`djangorestframework-simplejwt`)
- **pytest** / **pytest-django**
- **python-decouple** + **dj-database-url** (configuração de ambiente)
- **Gunicorn** (servidor WSGI)
- **Render** (deploy)

## 🔐 Autenticação

A API utiliza autenticação via JWT. Após o registro, o usuário obtém um par de tokens (`access` e `refresh`) que devem ser enviados no header das requisições autenticadas:

```
Authorization: Bearer <access_token>
```

## 📌 Endpoints principais

### Usuários

| Método | Endpoint               | Descrição                          |
|--------|-------------------------|-------------------------------------|
| POST   | `/users/register/`      | Cria um novo usuário                |
| POST   | `/users/token/`         | Login (retorna access + refresh)    |
| POST   | `/users/token/refresh/` | Renova o token de acesso            |

### Times

| Método | Endpoint                                  | Descrição                                  | Permissão        |
|--------|---------------------------------------------|---------------------------------------------|-------------------|
| GET    | `/times/times`                              | Lista os times do usuário autenticado       | Autenticado       |
| POST   | `/times/times`                              | Cria um time (criador se torna gerente)     | Autenticado       |
| GET    | `/times/times/{id}`                         | Detalha um time                             | Autenticado       |
| PATCH  | `/times/times/{id}`                         | Atualiza um time                            | Autenticado       |
| DELETE | `/times/times/{id}`                         | Remove um time                              | Autenticado       |
| POST   | `/times/times/{id}/adicionar_participante`  | Adiciona um participante ao time            | Gerente do time   |

### Tarefas

| Método | Endpoint                  | Descrição                          | Permissão                  |
|--------|-----------------------------|--------------------------------------|------------------------------|
| GET    | `/tarefas/tarefas`          | Lista tarefas dos times do usuário   | Membro ou gerente do time    |
| POST   | `/tarefas/tarefas`          | Cria uma tarefa                      | Gerente do time              |
| GET    | `/tarefas/tarefas/{id}`     | Detalha uma tarefa                   | Membro ou gerente do time    |
| PATCH  | `/tarefas/tarefas/{id}`     | Atualiza uma tarefa                  | Gerente do time              |
| DELETE | `/tarefas/tarefas/{id}`     | Remove uma tarefa                    | Gerente do time              |

## 🗂️ Modelagem

- **User** — usuário do sistema, estende o `AbstractUser` do Django.
- **Time** — workspace/time de trabalho.
- **Participante** — tabela intermediária entre `User` e `Time`, armazenando o papel (`GERENTE` ou `MEMBRO`) de cada usuário em cada time.
- **Tarefas** — pertence a um time, com responsável, criador, status e prazo.

## ✅ Testes

O projeto conta com testes automatizados usando `pytest`, cobrindo os fluxos críticos de permissão:

- Usuário não autenticado não pode criar times
- Membro não pode criar tarefas
- Gerente pode criar tarefas

```bash
pytest
```

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/Arthur-tanaka/API-BACK-END-GESTAO_TIMES.git
cd API-BACK-END-GESTAO_TIMES

# Crie e ative o ambiente virtual
python -m venv venv
source venv/bin/activate  # macOS/Linux; no Windows use venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Copie o exemplo e configure as variáveis necessárias
cp .env.example .env
# Edite SECRET_KEY no arquivo .env antes de usar a aplicação

# Rode as migrações
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```

### Front-end

O front-end fica em `frontend/` e usa Vite. Em um segundo terminal, inicie a API com `python manage.py runserver` e rode:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O servidor de desenvolvimento encaminha as chamadas de `/users`, `/times` e `/tarefas` para a API local em `http://127.0.0.1:8000`.

## 👤 Autor

Desenvolvido por **Arthur Tanaka** como projeto de portfólio, com foco em back-end Python/Django.

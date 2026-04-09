# Mesa Software

Sistema para operacao de cardapio, pedidos, comandas, estoque, gestao e usuarios em estabelecimentos comerciais.

## Estrutura

- `API/MesaApi`: API ASP.NET Core com Entity Framework e MySQL
- `ServiceWA/Back-End`: aplicacao Flask
- `ServiceWA/Front-End`: templates, CSS e JavaScript
- `docker-compose.yml`: sobe banco, API e interface web

## Requisitos

- Docker
- Docker Compose

## Configuracao

1. Crie um arquivo `.env` na raiz com base em `.env.example`
2. Preencha as senhas e secrets antes de subir em qualquer servidor

Exemplo:

```env
MYSQL_DATABASE=mesa
MYSQL_ROOT_PASSWORD=troque-esta-senha-root
MESA_CONNECTION_STRING=server=mesadb;Port=3306;database=mesa;user=root;password=troque-esta-senha-root
DEFAULT_ADMIN_NAME=Administrador
DEFAULT_ADMIN_LOGIN=admin
DEFAULT_ADMIN_PASSWORD=troque-esta-senha-admin
DEFAULT_ADMIN_PROFILE=Admin
DEFAULT_ADMIN_UPDATE_ON_STARTUP=false
FLASK_SECRET_KEY=troque-esta-secret-key
SERVICEWA_API_BASE_URL=http://mesaapi:5080/api
```

## Como subir

```bash
docker compose --env-file .env up -d --build
```

## Acessos

- Front-End: `http://localhost:5000`
- API: `http://localhost:5080`
- Swagger: `http://localhost:5080/swagger`

## Usuario admin inicial

A API pode criar o primeiro usuario admin no startup usando as variaveis:

- `DEFAULT_ADMIN_LOGIN`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_PROFILE`

Se `DEFAULT_ADMIN_UPDATE_ON_STARTUP=true`, o usuario admin padrao sera atualizado ao iniciar a API.

## Observacoes de seguranca

- Nao suba `.env`, `MesaDb/`, `*.pem`, `*.key` ou certificados para o GitHub
- Troque todas as senhas padrao antes de publicar em servidor
- Revise portas expostas e acesso ao MySQL em ambiente de producao


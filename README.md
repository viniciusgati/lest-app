# EduTrack

Aplicativo PWA para gestão de estudos voltado a vestibular e concursos públicos.

## Visão Geral

- **Backend:** Ruby on Rails 8.x (API mode) — `/backend`
- **Frontend:** Angular 17+ PWA — `/frontend`
- **Banco:** PostgreSQL
- **Auth:** Devise + Devise-JWT
- **Deploy:** Railway (serviço único)

## Pré-requisitos

- Ruby 3.3+
- Rails 8+
- Node.js 18+
- PostgreSQL 14+

## Setup Local

### 1. Clone o repositório

```bash
git clone <repo-url>
cd edutrack
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais locais do PostgreSQL
```

### 3. Instale as dependências do backend

```bash
cd backend
bundle install
```

### 4. Crie o banco de dados

```bash
bundle exec rails db:create
```

### 5. Suba o servidor

```bash
bundle exec rails server
# ou da raiz do projeto:
# foreman start (requer gem foreman)
```

O servidor estará disponível em `http://localhost:3000`.

## Health Check

```bash
curl http://localhost:3000/health
# => {"status":"ok"}
```

## Estrutura do Projeto

```
/
├── backend/        # Rails API
├── frontend/       # Angular PWA (setup em story 1.2)
├── Procfile        # Entry point para Railway
├── .gitignore
└── README.md
```

## Rodando os Testes

```bash
cd backend
bundle exec rspec
```

## Deploy (Railway)

O deploy é configurado via `Procfile` na raiz. Railway detecta automaticamente
o `Procfile` e executa o comando `web`.

Configure as variáveis de ambiente no painel do Railway:

- `DATABASE_URL` (PostgreSQL completo)
- `RAILS_ENV=production`
- `SECRET_KEY_BASE`

---
id: "epic-1"
title: "Fundação — Setup do Projeto EduTrack"
status: In Progress
priority: P0
created_at: "2026-03-10"
updated_at: "2026-03-10"
owner: "@dev"
---

# Epic 1 — Fundação: Setup do Projeto EduTrack

## Objetivo

Estabelecer a base técnica do projeto EduTrack: monorepo estruturado, backend Rails configurado, frontend Angular PWA integrado e autenticação JWT funcional. Ao final deste epic, o time terá uma fundação sólida e padronizada para começar o desenvolvimento de features.

## Contexto do Produto

**EduTrack** é um aplicativo PWA para gestão de estudos voltado a vestibular e concursos públicos. Permite ao estudante organizar matérias, registrar sessões de estudo e acompanhar o progresso.

**Stack definida:**
- Backend: Ruby on Rails 7.1+ (API mode)
- Frontend: Angular 17+ PWA (servido pelo Rails em `public/`)
- Banco: PostgreSQL 14+
- Auth: Devise + Devise-JWT
- Deploy: Railway (serviço único, monorepo)
- Linguagem: Ruby 3.3+ / Node 18+

## Escopo

Este epic cobre exclusivamente a infraestrutura base do projeto. Features de negócio (matérias, sessões de estudo, progresso) são tratadas em epics subsequentes.

---

## Stories

| Story | Título | Status | Executor |
|-------|--------|--------|----------|
| 1.1 | Setup Monorepo + Rails API | ✅ Aprovado (GO) | @dev |
| 1.2 | Setup Angular PWA | 📝 A criar | @dev |
| 1.3 | Setup Autenticação (Devise + JWT) | 📝 A criar | @dev |

---

## Story 1.1 — Setup Monorepo + Rails API

**Arquivo:** `docs/stories/1.1.story.md`
**Status:** Aprovado pelo @po
**Escopo:**
- Estrutura de monorepo (`/backend`, `/frontend`)
- Rails 7.1+ em modo API com PostgreSQL
- Health check endpoint `GET /health`
- Procfile para Railway
- `.gitignore`, `README.md`
- Testes com RSpec

**Acceptance Criteria resumidos:**
- AC1: Monorepo com `/backend` e `/frontend`
- AC2: Rails 7+ API mode em `/backend`
- AC3: PostgreSQL configurado (`database.yml`)
- AC4: `rails db:create` sem erros
- AC5: Procfile para Railway
- AC6: `.gitignore` completo
- AC7: `README.md` com setup local
- AC8: `rails server` sobe sem erros
- AC9: `GET /health` retorna `{ status: "ok" }`

---

## Story 1.2 — Setup Angular PWA *(a criar)*

**Escopo previsto:**
- Angular 17+ criado em `/frontend`
- Configurado como PWA (`@angular/pwa`)
- Build de produção gerado em `backend/public/`
- Rails configurado para servir Angular (catch-all route)
- Hot reload em desenvolvimento

---

## Story 1.3 — Setup Autenticação *(a criar)*

**Escopo previsto:**
- Devise instalado e configurado em modo API
- Devise-JWT para tokens de autenticação
- Endpoints: `POST /auth/sign_in`, `DELETE /auth/sign_out`
- Modelo `User` com campos básicos (email, password)
- Middleware JWT validando rotas protegidas
- Testes de autenticação com RSpec

---

## Critérios de Conclusão do Epic

- [ ] Story 1.1 implementada e PR mergeado
- [ ] Story 1.2 implementada e PR mergeado
- [ ] Story 1.3 implementada e PR mergeado
- [ ] `rails server` sobe o stack completo (Rails + Angular)
- [ ] Autenticação JWT funcional end-to-end
- [ ] Deploy no Railway funcionando

## Riscos

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Conflito de versões Ruby/Rails | Baixa | Fixar versões no `Gemfile` |
| Build do Angular em `backend/public/` | Média | Documentar passo de build no README |
| CORS em desenvolvimento | Média | Configurar `rack-cors` desde a Story 1.1 |

## Dependências

- Nenhuma dependência de outros epics
- Requer: PostgreSQL local instalado para desenvolvimento

---

*Criado por @pm (Morgan) — referência para rastreabilidade das stories do Epic 1*

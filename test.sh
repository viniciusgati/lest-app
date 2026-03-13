#!/bin/bash
# test.sh — Suite unificada EduTrack
# Executa backend (RSpec) + frontend (Vitest) e exibe relatório minimalista consolidado.
# Exit 0: todos passam | Exit 1: há falhas

BACKEND_PASSED=0
BACKEND_FAILED=0
BACKEND_FAILURES=""
FRONTEND_PASSED=0
FRONTEND_FAILED=0
FRONTEND_FAILURES=""

# ─── Backend (RSpec) ──────────────────────────────────────────────────────────
BACKEND_OUTPUT=$(cd backend && bundle exec rspec 2>&1)
BACKEND_EXIT=$?

# Extrair contagem do formato "Tests: X passed, Y failed"
BACKEND_SUMMARY=$(echo "$BACKEND_OUTPUT" | grep -E "^Tests: [0-9]+ passed")
if [ -n "$BACKEND_SUMMARY" ]; then
  BACKEND_PASSED=$(echo "$BACKEND_SUMMARY" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
  BACKEND_FAILED=$(echo "$BACKEND_SUMMARY" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+")
fi

# Capturar falhas do bloco FAILED:
BACKEND_FAILURES=$(echo "$BACKEND_OUTPUT" | grep -E "^\s+\[backend\]")

# ─── Frontend (Vitest) ────────────────────────────────────────────────────────
FRONTEND_OUTPUT=$(cd frontend && npm test 2>&1)
FRONTEND_EXIT=$?

# Remover ANSI escape codes antes de parsear (Vitest usa cores por padrão)
FRONTEND_OUTPUT_CLEAN=$(echo "$FRONTEND_OUTPUT" | sed 's/\x1b\[[0-9;]*m//g')

# Extrair contagem da linha "Tests  X passed (X)" do Vitest nativo
FRONTEND_SUMMARY=$(echo "$FRONTEND_OUTPUT_CLEAN" | grep -E "Tests\s+[0-9]+ passed")
if [ -n "$FRONTEND_SUMMARY" ]; then
  FRONTEND_PASSED=$(echo "$FRONTEND_SUMMARY" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+")
  FAILED_PART=$(echo "$FRONTEND_SUMMARY" | grep -oE "[0-9]+ failed")
  FRONTEND_FAILED=$(echo "$FAILED_PART" | grep -oE "[0-9]+" || echo "0")
fi

# Capturar falhas (strip ANSI para matching)
FRONTEND_FAILURES=$(echo "$FRONTEND_OUTPUT_CLEAN" | grep -E "^\s+\[frontend\]")

# ─── Relatório consolidado ────────────────────────────────────────────────────
TOTAL_PASSED=$(( BACKEND_PASSED + FRONTEND_PASSED ))
TOTAL_FAILED=$(( BACKEND_FAILED + FRONTEND_FAILED ))

echo ""
echo "Tests: ${TOTAL_PASSED} passed, ${TOTAL_FAILED} failed"

if [ "$TOTAL_FAILED" -gt 0 ]; then
  echo ""
  echo "FAILED:"
  [ -n "$BACKEND_FAILURES" ] && echo "$BACKEND_FAILURES"
  [ -n "$FRONTEND_FAILURES" ] && echo "$FRONTEND_FAILURES"
fi

# ─── Exit code ───────────────────────────────────────────────────────────────
if [ $BACKEND_EXIT -eq 0 ] && [ $FRONTEND_EXIT -eq 0 ]; then
  exit 0
else
  exit 1
fi

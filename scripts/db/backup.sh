#!/usr/bin/env bash
# Script de Backup Automatizado do Banco PostgreSQL da UPA
# Exemplo de uso: ./scripts/db/backup.sh /caminho/para/backups

set -e

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/vitaloop_upa_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Iniciando Backup do Prontuário Vitaloop UPA..."
pg_dump "${DATABASE_URL:-postgres://vitaloop_admin:vitaloop_secret_pass@localhost:5432/vitaloop_upa}" \
  --clean --if-exists --create --quote-all-identifiers \
  | gzip > "$BACKUP_FILE"

echo "Backup concluído com sucesso: ${BACKUP_FILE}"

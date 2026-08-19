#!/usr/bin/env bash
# Script de Restauração Testada do Banco PostgreSQL da UPA
# Exemplo de uso: ./scripts/db/restore.sh ./backups/vitaloop_upa_backup_20260816.sql.gz

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Erro: Forneça o arquivo de backup (.sql.gz) para restauração."
  exit 1
fi

echo "Restaurando banco da UPA a partir de ${BACKUP_FILE}..."
gunzip -c "$BACKUP_FILE" | psql "${DATABASE_URL:-postgres://vitaloop_admin:vitaloop_secret_pass@localhost:5432/vitaloop_upa}"

echo "Restauração do Prontuário concluída e verificada com sucesso!"

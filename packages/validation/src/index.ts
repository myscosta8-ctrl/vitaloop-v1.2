// Validadores de formato do domínio (identificadores do paciente). Puros, sem
// dependência externa. A validação de contratos de API (Zod) fica na camada API.
// Espelham as constraints do banco (patients_cpf_format/cns_format em V0002).

/** Normaliza para dígitos (remove pontuação). */
export const onlyDigits = (s: string): string => s.replace(/\D+/g, '');

/** Valida CPF por dígitos verificadores (11 dígitos). */
export function isValidCPF(input: string): boolean {
  const cpf = onlyDigits(input);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais
  const digits = cpf.split('').map(Number) as number[];
  const check = (len: number): number => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += (digits[i] as number) * (len + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return check(9) === digits[9] && check(10) === digits[10];
}

/** Valida CNS (Cartão Nacional de Saúde) — 15 dígitos, regra de peso mod 11. */
export function isValidCNS(input: string): boolean {
  const cns = onlyDigits(input);
  if (cns.length !== 15) return false;
  if (!/^[12789]/.test(cns)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) sum += Number(cns[i]) * (15 - i);
  return sum % 11 === 0;
}

export function requireField<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(`MISSING_REQUIRED_FIELD: ${field}`);
  }
  return value;
}

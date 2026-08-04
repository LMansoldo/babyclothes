export interface WaitlistFormValues {
  nome: string;
  telefone: string;
  email: string;
  interesse: string;
}

export function readFormValues(data: FormData): Partial<WaitlistFormValues> {
  return {
    nome: data.get('nome')?.toString().trim() || undefined,
    telefone: data.get('telefone')?.toString().trim() || undefined,
    email: data.get('email')?.toString().trim() || undefined,
    interesse: data.get('interesse')?.toString().trim() || undefined,
  };
}

export function isCompleteWaitlistForm(
  values: Partial<WaitlistFormValues>,
): values is WaitlistFormValues {
  return Boolean(values.nome && values.telefone && values.email && values.interesse);
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === code
  );
}

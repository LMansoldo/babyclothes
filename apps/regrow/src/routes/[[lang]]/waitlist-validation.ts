export interface WaitlistFormValues {
  nome: string;
  email: string;
  cidade: string;
  fase: string;
  telefone?: string;
}

export function readFormValues(data: FormData): Partial<WaitlistFormValues> {
  return {
    nome: data.get('nome')?.toString().trim() || undefined,
    email: data.get('email')?.toString().trim() || undefined,
    cidade: data.get('cidade')?.toString().trim() || undefined,
    fase: data.get('fase')?.toString().trim() || undefined,
    telefone: data.get('telefone')?.toString().trim() || undefined,
  };
}

export function isCompleteWaitlistForm(
  values: Partial<WaitlistFormValues>,
): values is WaitlistFormValues {
  return Boolean(values.nome && values.email && values.cidade && values.fase);
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

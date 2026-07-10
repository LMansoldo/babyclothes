const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;

export function stripDocument(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
  const digits = stripDocument(value).slice(0, CPF_LENGTH);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function formatCnpj(value: string): string {
  const digits = stripDocument(value).slice(0, CNPJ_LENGTH);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || allSameDigit(digits)) return false;
  const numbers = digits.split('').map(Number);
  const first = cpfDigit(numbers.slice(0, 9), 10);
  const second = cpfDigit([...numbers.slice(0, 9), first], 11);
  return first === numbers[9] && second === numbers[10];
}

export function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits) || allSameDigit(digits)) return false;
  const numbers = digits.split('').map(Number);
  const first = cnpjDigit(numbers.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = cnpjDigit([...numbers.slice(0, 12), first], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === numbers[12] && second === numbers[13];
}

function allSameDigit(digits: string): boolean {
  return digits.split('').every((digit) => digit === digits[0]);
}

function cpfDigit(numbers: number[], initialWeight: number): number {
  const sum = numbers.reduce((acc, digit, index) => acc + digit * (initialWeight - index), 0);
  return verifierFromSum(sum);
}

function cnpjDigit(numbers: number[], weights: number[]): number {
  const sum = numbers.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  return verifierFromSum(sum);
}

function verifierFromSum(sum: number): number {
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

import { describe, it, expect } from 'vitest';
import {
  stripDocument,
  formatCpf,
  formatCnpj,
  isValidCpf,
  isValidCnpj,
} from './Document';

describe('stripDocument', () => {
  it('keeps only digits', () => {
    expect(stripDocument('529.982.247-25')).toBe('52998224725');
    expect(stripDocument('abc')).toBe('');
  });
});

describe('formatCpf', () => {
  it('formats a full CPF', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });

  it('formats partial input progressively', () => {
    expect(formatCpf('529')).toBe('529');
    expect(formatCpf('5299')).toBe('529.9');
    expect(formatCpf('5299822479')).toBe('529.982.247-9');
  });

  it('caps at 11 digits', () => {
    expect(formatCpf('529982247251234')).toBe('529.982.247-25');
  });
});

describe('formatCnpj', () => {
  it('formats a full CNPJ', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('formats partial input progressively', () => {
    expect(formatCnpj('112223')).toBe('11.222.3');
  });

  it('caps at 14 digits', () => {
    expect(formatCnpj('112223330001819')).toBe('11.222.333/0001-81');
  });
});

describe('isValidCpf', () => {
  it('accepts checksum-valid CPFs', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('rejects bad checksum, repeats and wrong length', () => {
    expect(isValidCpf('12345678900')).toBe(false);
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('5299822472')).toBe(false);
  });
});

describe('isValidCnpj', () => {
  it('accepts checksum-valid CNPJs', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
    expect(isValidCnpj('11444777000161')).toBe(true);
  });

  it('rejects bad checksum, repeats and wrong length', () => {
    expect(isValidCnpj('11222333000180')).toBe(false);
    expect(isValidCnpj('11111111111111')).toBe(false);
    expect(isValidCnpj('1122233300018')).toBe(false);
  });
});

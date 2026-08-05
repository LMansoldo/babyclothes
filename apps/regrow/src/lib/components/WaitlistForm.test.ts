import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WaitlistForm from './WaitlistForm.svelte';
import { waitlistEmail } from '../stores/waitlist-email';

describe('WaitlistForm', () => {
  afterEach(() => {
    waitlistEmail.set('');
  });

  it('renders all 4 fields with translated labels when there is no prior submission', () => {
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('O que você mais busca?')).toBeInTheDocument();
  });

  it('renders the 4 interest options with the exact spec values', () => {
    render(WaitlistForm, { props: { form: null } });
    const select = screen.getByLabelText('O que você mais busca?') as HTMLSelectElement;
    const values = Array.from(select.options).map((option) => option.value);
    expect(values).toEqual(['', 'roupas', 'acessorios', 'crescimento', 'tudo']);
  });

  it('shows the error message with role=alert when form.errorKey is set', () => {
    render(WaitlistForm, {
      props: { form: { errorKey: 'form.error_required', values: {} } },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Preencha todos os campos obrigatórios.',
    );
  });

  it('preserves submitted field values after a validation error', () => {
    render(WaitlistForm, {
      props: {
        form: {
          errorKey: 'form.error_email',
          values: { nome: 'Maria', telefone: '119999', email: 'bad', interesse: 'roupas' },
        },
      },
    });
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Maria');
  });

  it('shows the success confirmation instead of the form when form.success is true', () => {
    render(WaitlistForm, { props: { form: { success: true } } });
    expect(screen.getByText('Você está na lista!')).toBeInTheDocument();
    expect(screen.getByText('Avisaremos assim que abrirmos o acesso.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome completo')).toBeNull();
  });

  it('pre-fills the email field from the waitlistEmail store when there is no prior submission', () => {
    waitlistEmail.set('ana@example.com');
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@example.com');
  });

  it('prefers a previously submitted email over the waitlistEmail store value', () => {
    waitlistEmail.set('store@example.com');
    render(WaitlistForm, {
      props: { form: { errorKey: 'form.error_email', values: { email: 'bad-input' } } },
    });
    expect(screen.getByLabelText('E-mail')).toHaveValue('bad-input');
  });
});

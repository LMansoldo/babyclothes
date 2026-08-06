import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import WaitlistForm from './WaitlistForm.svelte';
import { waitlistEmail } from '../stores/waitlist-email';

describe('WaitlistForm', () => {
  afterEach(() => {
    waitlistEmail.set('');
  });

  it('renders all 5 fields with translated labels when there is no prior submission', () => {
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('WhatsApp (opcional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Cidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Em que fase você está?')).toBeInTheDocument();
  });

  it('marks WhatsApp as optional (not required)', () => {
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('WhatsApp (opcional)')).not.toBeRequired();
  });

  it('marks nome, email, cidade and fase as required', () => {
    render(WaitlistForm, { props: { form: null } });
    expect(screen.getByLabelText('Nome')).toBeRequired();
    expect(screen.getByLabelText('E-mail')).toBeRequired();
    expect(screen.getByLabelText('Cidade')).toBeRequired();
    expect(screen.getByLabelText('Em que fase você está?')).toBeRequired();
  });

  it('renders the 5 stage options with the exact spec values', () => {
    render(WaitlistForm, { props: { form: null } });
    const select = screen.getByLabelText('Em que fase você está?') as HTMLSelectElement;
    const values = Array.from(select.options).map((option) => option.value);
    expect(values).toEqual(['', 'gravida', '0_6', '6_12', '1_3anos', 'outro']);
  });

  it('shows the error message with role=alert when form.errorKey is set', () => {
    render(WaitlistForm, {
      props: { form: { errorKey: 'form.error_required', values: {} } },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Preencha os campos obrigatórios.');
  });

  it('preserves submitted field values after a validation error', () => {
    render(WaitlistForm, {
      props: {
        form: {
          errorKey: 'form.error_email',
          values: { nome: 'Maria', email: 'bad', cidade: 'São Paulo', fase: 'gravida' },
        },
      },
    });
    expect(screen.getByLabelText('Nome')).toHaveValue('Maria');
    expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo');
  });

  it('shows the success confirmation instead of the form when form.success is true', () => {
    render(WaitlistForm, { props: { form: { success: true } } });
    expect(screen.getByText('Você tá dentro!')).toBeInTheDocument();
    expect(
      screen.getByText('Vamos te avisar assim que abrirmos o acesso na sua região.'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).toBeNull();
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

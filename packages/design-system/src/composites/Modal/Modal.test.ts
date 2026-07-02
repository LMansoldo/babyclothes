import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Modal from './Modal.svelte';

describe('Modal', () => {
  it('does not render when open=false', () => {
    const { container } = render(Modal, {
      props: { open: false, title: 'Teste' },
    });
    expect(container.querySelector('.modal-backdrop')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(Modal, { props: { open: true, title: 'Teste' } });
    expect(screen.getByText('Teste')).toBeInTheDocument();
  });

  it('renders with role="dialog" and aria-modal', () => {
    render(Modal, { props: { open: true, title: 'Teste' } });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('applies default variant class', () => {
    const { container } = render(Modal, { props: { open: true, title: 'Teste' } });
    expect(container.querySelector('.modal')).toHaveClass('modal--default');
  });

  it('applies danger variant class', () => {
    const { container } = render(Modal, { props: { open: true, title: 'Teste', variant: 'danger' } });
    expect(container.querySelector('.modal')).toHaveClass('modal--danger');
  });

  it('applies pk variant class', () => {
    const { container } = render(Modal, { props: { open: true, title: 'Teste', variant: 'pk' } });
    expect(container.querySelector('.modal')).toHaveClass('modal--pk');
  });

  it('renders children via Snippet', () => {
    const { container } = render(Modal, {
      props: {
        open: true,
        title: 'Teste',
        children: () => '<p>Conteúdo</p>',
      },
    });
    expect(container.querySelector('.modal__body')).toBeInTheDocument();
  });

  it('renders footer via Snippet', () => {
    const { container } = render(Modal, {
      props: {
        open: true,
        title: 'Teste',
        footer: () => '<button>OK</button>',
      },
    });
    expect(container.querySelector('.modal__footer')).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const onclose = vi.fn();
    // Modal uses $bindable open — the test needs to pass open as a writable
    const props: { open: boolean; title: string; onclose: () => void } = {
      open: true,
      title: 'Teste',
      onclose,
    };
    const { component } = render(Modal, { props });
    await fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onclose).toHaveBeenCalledOnce();
  });

  it('calls onclose when close button clicked', async () => {
    const onclose = vi.fn();
    render(Modal, { props: { open: true, title: 'Teste', onclose } });
    await fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onclose).toHaveBeenCalledOnce();
  });

  it('does not render close button icon when not open', () => {
    const { container } = render(Modal, { props: { open: false, title: 'Teste' } });
    expect(container.querySelector('.modal__close')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(Modal, { props: { open: true, title: 'Confirmação' } });
    expect(screen.getByText('Confirmação')).toBeInTheDocument();
  });

  it('has aria-label on dialog matching title', () => {
    render(Modal, { props: { open: true, title: 'Aviso Importante' } });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Aviso Importante');
  });

  it('renders danger icon for danger variant', () => {
    const { container } = render(Modal, {
      props: { open: true, title: 'Cuidado', variant: 'danger' },
    });
    expect(container.querySelector('.modal__icon--danger')).toBeInTheDocument();
  });

  it('renders heart icon for pk variant', () => {
    const { container } = render(Modal, {
      props: { open: true, title: 'Parabéns', variant: 'pk' },
    });
    expect(container.querySelector('.modal__icon--pk')).toBeInTheDocument();
  });

  it('does not render variant icon for default variant', () => {
    const { container } = render(Modal, {
      props: { open: true, title: 'Info', variant: 'default' },
    });
    expect(container.querySelector('.modal__icon')).not.toBeInTheDocument();
  });
});

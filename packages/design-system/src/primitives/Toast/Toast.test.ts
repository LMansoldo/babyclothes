import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Toast from './Toast.svelte';

describe('Toast', () => {
  it('renders message text', () => {
    render(Toast, { props: { message: 'Item salvo com sucesso' } });
    expect(screen.getByText('Item salvo com sucesso')).toBeInTheDocument();
  });

  it('applies type=info class by default', () => {
    render(Toast, { props: { message: 'Info' } });
    expect(document.querySelector('.toast')).toHaveClass('toast--info');
  });

  it('applies type=success class', () => {
    render(Toast, { props: { message: 'Sucesso!', type: 'success' } });
    expect(document.querySelector('.toast')).toHaveClass('toast--success');
  });

  it('applies type=warning class', () => {
    render(Toast, { props: { message: 'Atenção', type: 'warning' } });
    expect(document.querySelector('.toast')).toHaveClass('toast--warning');
  });

  it('applies type=error class', () => {
    render(Toast, { props: { message: 'Erro', type: 'error' } });
    expect(document.querySelector('.toast')).toHaveClass('toast--error');
  });

  it('applies type=pk class', () => {
    render(Toast, { props: { message: 'Novo match!', type: 'pk' } });
    expect(document.querySelector('.toast')).toHaveClass('toast--pk');
  });

  it('renders close button by default', () => {
    render(Toast, { props: { message: 'Mensagem' } });
    expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument();
  });

  it('does not render close button when closable=false', () => {
    render(Toast, { props: { message: 'Mensagem', closable: false } });
    expect(screen.queryByRole('button', { name: /fechar/i })).not.toBeInTheDocument();
  });

  it('calls onclose when close button clicked', async () => {
    const handler = vi.fn();
    render(Toast, { props: { message: 'Mensagem', onclose: handler } });
    await fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders title when provided', () => {
    render(Toast, { props: { message: 'Detalhes', title: 'Atenção' } });
    expect(screen.getByText('Atenção')).toBeInTheDocument();
  });

  it('renders colored left bar', () => {
    render(Toast, { props: { message: 'Ok' } });
    expect(document.querySelector('.toast__bar')).toBeInTheDocument();
  });
});

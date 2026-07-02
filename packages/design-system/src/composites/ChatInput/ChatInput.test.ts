import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ChatInput from './ChatInput.svelte';

describe('ChatInput', () => {
  it('renders textarea with default placeholder', () => {
    render(ChatInput);
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    expect(textarea).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(ChatInput, { props: { placeholder: 'Fale conosco' } });
    expect(screen.getByPlaceholderText('Fale conosco')).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(ChatInput);
    expect(screen.getByLabelText('Enviar')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(ChatInput);
    expect(screen.getByLabelText('Adicionar')).toBeInTheDocument();
  });

  it('send button is disabled when textarea is empty', () => {
    render(ChatInput);
    expect(screen.getByLabelText('Enviar')).toBeDisabled();
  });

  it('send button is enabled when textarea has text', async () => {
    render(ChatInput);
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await fireEvent.input(textarea, { target: { value: 'Olá' } });
    expect(screen.getByLabelText('Enviar')).not.toBeDisabled();
  });

  it('calls onsend with message text on send click', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onsend: handler } });
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await fireEvent.input(textarea, { target: { value: 'Olá' } });
    await fireEvent.click(screen.getByLabelText('Enviar'));
    expect(handler).toHaveBeenCalledWith('Olá');
  });

  it('clears textarea after sending', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onsend: handler } });
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...') as HTMLTextAreaElement;
    await fireEvent.input(textarea, { target: { value: 'Olá' } });
    await fireEvent.click(screen.getByLabelText('Enviar'));
    expect(textarea.value).toBe('');
  });

  it('sends message on Enter key', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onsend: handler } });
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await fireEvent.input(textarea, { target: { value: 'Olá' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(handler).toHaveBeenCalledWith('Olá');
  });

  it('does not send on Shift+Enter', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onsend: handler } });
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await fireEvent.input(textarea, { target: { value: 'Olá' } });
    await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls onadd when add button is clicked', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onadd: handler } });
    await fireEvent.click(screen.getByLabelText('Adicionar'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('renders quick action chips when provided', () => {
    const actions = [
      { label: 'Mais opções', value: 'opcoes' },
      { label: 'Ajuda', value: 'ajuda' },
    ];
    render(ChatInput, { props: { quickActions: actions } });
    expect(screen.getByText('Mais opções')).toBeInTheDocument();
    expect(screen.getByText('Ajuda')).toBeInTheDocument();
  });

  it('sends quick action value on chip click', async () => {
    const handler = vi.fn();
    const actions = [{ label: 'Ajuda', value: 'ajuda' }];
    render(ChatInput, { props: { quickActions: actions, onsend: handler } });
    await fireEvent.click(screen.getByText('Ajuda'));
    expect(handler).toHaveBeenCalledWith('ajuda');
  });

  it('shows typing indicator when loading=true', () => {
    render(ChatInput, { props: { loading: true } });
    expect(screen.getByLabelText('Digitando')).toBeInTheDocument();
  });

  it('hides send button when loading=true', () => {
    render(ChatInput, { props: { loading: true } });
    expect(screen.queryByLabelText('Enviar')).not.toBeInTheDocument();
  });

  it('does not call onsend when loading=true', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { loading: true, onsend: handler } });
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await fireEvent.input(textarea, { target: { value: 'Olá' } });
    await fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not send empty message', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onsend: handler } });
    await fireEvent.click(screen.getByLabelText('Enviar'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not send whitespace-only message', async () => {
    const handler = vi.fn();
    render(ChatInput, { props: { onsend: handler } });
    const textarea = screen.getByPlaceholderText('Digite sua mensagem...');
    await fireEvent.input(textarea, { target: { value: '   ' } });
    await fireEvent.click(screen.getByLabelText('Enviar'));
    expect(handler).not.toHaveBeenCalled();
  });
});

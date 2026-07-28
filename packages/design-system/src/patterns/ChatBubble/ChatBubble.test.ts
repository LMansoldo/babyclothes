import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ChatBubble from './ChatBubble.svelte';

describe('ChatBubble', () => {
  it('renders content text', () => {
    render(ChatBubble, { props: { role: 'user', content: 'Olá!' } });
    expect(screen.getByText('Olá!')).toBeInTheDocument();
  });

  it('applies user modifier class', () => {
    const { container } = render(ChatBubble, { props: { role: 'user', content: 'Msg' } });
    expect(container.querySelector('.chat-bubble--user')).not.toBeNull();
  });

  it('applies agent modifier class', () => {
    const { container } = render(ChatBubble, { props: { role: 'agent', content: 'Msg' } });
    expect(container.querySelector('.chat-bubble--agent')).not.toBeNull();
  });

  it('applies system modifier class', () => {
    const { container } = render(ChatBubble, { props: { role: 'system', content: 'Info' } });
    expect(container.querySelector('.chat-bubble--system')).not.toBeNull();
  });

  it('renders timestamp when provided', () => {
    render(ChatBubble, { props: { role: 'user', content: 'Msg', timestamp: '10:30' } });
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('does not render timestamp element when omitted', () => {
    const { container } = render(ChatBubble, { props: { role: 'user', content: 'Msg' } });
    expect(container.querySelector('.chat-bubble__time')).toBeNull();
  });

  it('defaults to dark surface', () => {
    const { container } = render(ChatBubble, { props: { role: 'agent', content: 'Msg' } });
    expect(container.querySelector('.chat-bubble--dark')).not.toBeNull();
    expect(container.querySelector('.chat-bubble--light')).toBeNull();
  });

  it('applies light surface class', () => {
    const { container } = render(ChatBubble, { props: { role: 'agent', content: 'Msg', surface: 'light' } });
    expect(container.querySelector('.chat-bubble--light')).not.toBeNull();
    expect(container.querySelector('.chat-bubble--dark')).toBeNull();
  });
});

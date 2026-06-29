import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import NotificationCard from './NotificationCard.svelte'

describe('NotificationCard', () => {
  it('renders title', () => {
    render(NotificationCard, {
      props: {
        type: 'growth_prediction',
        title: 'Mudança de tamanho',
        body: 'Sofia vai precisar de G em breve.',
        timeAgo: 'há 2 min',
      },
    })
    expect(screen.getByText('Mudança de tamanho')).toBeInTheDocument()
  })

  it('renders body text', () => {
    render(NotificationCard, {
      props: {
        type: 'growth_prediction',
        title: 'Mudança de tamanho',
        body: 'Sofia vai precisar de G em breve.',
        timeAgo: 'há 2 min',
      },
    })
    expect(screen.getByText('Sofia vai precisar de G em breve.')).toBeInTheDocument()
  })

  it('renders timeAgo below body', () => {
    const { container } = render(NotificationCard, {
      props: {
        type: 'growth_prediction',
        title: 'Mudança de tamanho',
        body: 'Sofia vai precisar de G em breve.',
        timeAgo: 'há 2 min',
      },
    })
    expect(container.querySelector('.notification-card__time')).toBeInTheDocument()
    expect(screen.getByText('há 2 min')).toBeInTheDocument()
  })

  it('shows unread dot next to title when not read', () => {
    render(NotificationCard, {
      props: { type: 'growth_prediction', title: 'Mudança de tamanho', body: 'Sofia vai precisar de G em breve.', timeAgo: 'há 2 min', isRead: false }
    })
    expect(document.querySelector('.notification-card__dot')).toBeInTheDocument()
  })

  it('does not show unread dot when read', () => {
    render(NotificationCard, {
      props: { type: 'system', title: 'Bem-vindo', body: 'Cadastro confirmado.', timeAgo: 'há 3 dias', isRead: true }
    })
    expect(document.querySelector('.notification-card__dot')).not.toBeInTheDocument()
  })

  it('applies unread background when not read', () => {
    render(NotificationCard, {
      props: { type: 'growth_prediction', title: 'Teste', body: 'Corpo', timeAgo: 'agora', isRead: false }
    })
    expect(document.querySelector('.notification-card')).toHaveClass('notification-card--unread')
  })

  it('does not apply unread class when read', () => {
    render(NotificationCard, {
      props: { type: 'system', title: 'Teste', body: 'Corpo', timeAgo: 'agora', isRead: true }
    })
    expect(document.querySelector('.notification-card')).not.toHaveClass('notification-card--unread')
  })

  it('renders icon-circle for growth_prediction type', () => {
    const { container } = render(NotificationCard, {
      props: {
        type: 'growth_prediction',
        title: 'Mudança de tamanho',
        body: 'Sofia vai precisar de G em breve.',
        timeAgo: 'há 2 min',
      },
    })
    expect(container.querySelector('.notification-card__icon-circle')).toBeInTheDocument()
    expect(container.querySelector('.notification-card__icon-dot--growth')).toBeInTheDocument()
  })

  it('renders icon-dot--match for new_match type', () => {
    const { container } = render(NotificationCard, {
      props: {
        type: 'new_match',
        title: 'Novo match',
        body: 'Encontramos um item para você.',
        timeAgo: 'há 5 min',
      },
    })
    expect(container.querySelector('.notification-card__icon-dot--match')).toBeInTheDocument()
  })

  it('title-row contains both title and dot when unread', () => {
    const { container } = render(NotificationCard, {
      props: {
        type: 'system',
        title: 'Notificação',
        body: 'Detalhes aqui.',
        timeAgo: 'agora',
        isRead: false,
      },
    })
    const titleRow = container.querySelector('.notification-card__title-row')
    expect(titleRow).toBeInTheDocument()
    expect(titleRow!.querySelector('.notification-card__title')).toBeInTheDocument()
    expect(titleRow!.querySelector('.notification-card__dot')).toBeInTheDocument()
  })
})

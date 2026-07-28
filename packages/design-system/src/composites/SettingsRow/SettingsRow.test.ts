import { render, fireEvent } from '@testing-library/svelte'
import { describe, it, expect, vi } from 'vitest'
import SettingsRow from './SettingsRow.svelte'

describe('SettingsRow', () => {
  it('renders label', () => {
    const { getByText } = render(SettingsRow, { props: { label: 'My children' } })
    expect(getByText('My children')).toBeTruthy()
  })

  it('renders as button when onclick is provided', () => {
    const { container } = render(SettingsRow, { props: { label: 'Test', onclick: () => {} } })
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('renders as div when no onclick', () => {
    const { container } = render(SettingsRow, { props: { label: 'Test' } })
    expect(container.querySelector('div[role="group"]')).toBeTruthy()
    expect(container.querySelector('button')).toBeNull()
  })

  it('calls onclick when clicked', async () => {
    const handler = vi.fn()
    const { getByRole } = render(SettingsRow, { props: { label: 'Test', onclick: handler } })
    await fireEvent.click(getByRole('button'))
    expect(handler).toHaveBeenCalledOnce()
  })
})

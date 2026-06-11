import '../src/lib/tokens/tokens.css'
import type { Preview } from '@storybook/svelte'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'off-white',
      values: [
        { name: 'off-white', value: '#F4F3F0' },
        { name: 'white',     value: '#FFFFFF' },
        { name: 'dark',      value: '#0A0A0A' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview

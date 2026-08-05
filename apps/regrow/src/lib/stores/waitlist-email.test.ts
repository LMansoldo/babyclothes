import { describe, it, expect, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { waitlistEmail } from './waitlist-email';

describe('waitlistEmail store', () => {
  afterEach(() => {
    waitlistEmail.set('');
  });

  it('starts as an empty string', () => {
    expect(get(waitlistEmail)).toBe('');
  });

  it('holds whatever value is set on it', () => {
    waitlistEmail.set('ana@example.com');
    expect(get(waitlistEmail)).toBe('ana@example.com');
  });
});

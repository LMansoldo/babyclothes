import type { Cookies } from '@sveltejs/kit'
import { dev } from '$app/environment'

export const ACCESS_COOKIE = 'babyclothes_token'
export const REFRESH_COOKIE = 'babyclothes_refresh'

function cookieOpts(maxAge: number) {
  return { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' as const, maxAge }
}

export function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
  cookies.set(ACCESS_COOKIE, accessToken, cookieOpts(60 * 60)) // 1h
  cookies.set(REFRESH_COOKIE, refreshToken, cookieOpts(60 * 60 * 24 * 30)) // 30d
}

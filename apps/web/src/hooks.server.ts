import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const JWT_COOKIE = 'babyclothes_token';

const publicRoutes = ['/login'];

const mockSession = {
  userId: 'mock-user-1',
  email: 'mock@babyclothes.app',
  name: 'Dev User',
  avatarUrl: '',
  type: 'pf' as const,
  cpf: undefined,
  cnpj: undefined,
  isSeller: true,
};

export const handle: Handle = async ({ event, resolve }) => {
  const mockMode = import.meta.env.PUBLIC_MOCK_DATA === 'true';

  if (mockMode) {
    event.locals.session = mockSession;
    return resolve(event);
  }

  const token = event.cookies.get(JWT_COOKIE);

  if (token) {
    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL ?? '';
      const res = await fetch(`${apiUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const { user } = (await res.json()) as {
          user: { id: string; email: string; name: string; avatar_url: string; type: string | null; cpf?: string; cnpj?: string; is_seller: boolean };
        };
        event.locals.session = {
          userId: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          type: user.type as 'pf' | 'pj' | null,
          cpf: user.cpf,
          cnpj: user.cnpj,
          isSeller: user.is_seller,
        };
      } else {
        event.cookies.delete(JWT_COOKIE, { path: '/' });
        event.locals.session = undefined;
      }
    } catch (err) {
      console.error('Auth session validation failed:', err);
      event.locals.session = undefined;
    }
  } else {
    event.locals.session = undefined;
  }

  const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));

  if (!event.locals.session && !isPublicRoute) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};

import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { Actions } from './$types';
import {
  readFormValues,
  isCompleteWaitlistForm,
  EMAIL_REGEX,
  hasPrismaErrorCode,
} from './waitlist-validation';

export const actions = {
  waitlist: async ({ request, params }) => {
    const data = await request.formData();
    const values = readFormValues(data);
    const locale = params.lang ?? 'pt';

    if (!isCompleteWaitlistForm(values)) {
      return fail(400, { errorKey: 'form.error_required', values });
    }

    if (!EMAIL_REGEX.test(values.email)) {
      return fail(400, { errorKey: 'form.error_email', values });
    }

    try {
      await prisma.lead.create({
        data: { ...values, locale },
      });
      return { success: true };
    } catch (error) {
      if (hasPrismaErrorCode(error, 'P2002')) {
        return fail(409, { errorKey: 'form.error_duplicate', values });
      }
      // eslint-disable-next-line no-console
      console.error(error);
      return fail(500, { errorKey: 'form.error_server' });
    }
  },
} satisfies Actions;

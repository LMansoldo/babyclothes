import type { ActionResult } from '@sveltejs/kit'
import { get } from 'svelte/store'
import { t } from '$lib/i18n'
import { toast } from '$lib/stores/toast'

export interface ToastActionOptions {
  silent?: boolean
}

export function toastActionResult(result: ActionResult, opts?: ToastActionOptions): void {
  if (opts?.silent) return

  const translate = get(t)

  if (result.type === 'error') {
    toast.error(translate('errors.generic'))
    return
  }

  if (result.type === 'failure') {
    const data = result.data as Record<string, unknown> | undefined
    const status = result.status as number | undefined

    // Don't toast validation failures (4xx with specific error codes)
    if (data?.error === 'validation_failed' || data?.error === 'invalid_fields') return
    if (status && status < 500) return

    toast.error(translate('errors.generic'))
  }
}

export function stripDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** (11) 98765-4321 or (11) 3456-7890 — formats progressively as user types */
export function formatPhone(value: string): string {
  const d = stripDigits(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** 01310-100 */
export function formatCep(value: string): string {
  const d = stripDigits(value).slice(0, 8)
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`
}

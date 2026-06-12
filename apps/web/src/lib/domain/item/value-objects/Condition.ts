const VALID_CONDITIONS = ['new', 'like_new', 'used'] as const
export type ConditionValue = typeof VALID_CONDITIONS[number]

export class Condition {
  readonly value: ConditionValue

  constructor(value: string) {
    if (!(VALID_CONDITIONS as readonly string[]).includes(value)) {
      throw new Error(`Invalid condition: ${value}`)
    }
    this.value = value as ConditionValue
  }
}

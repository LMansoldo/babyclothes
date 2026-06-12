import type { IChildRepository, CreateChildInput } from '$lib/domain/child/repositories/IChildRepository'
import { CreateChildInputSchema } from '$lib/domain/child/schemas'
import type { Child } from '$lib/domain/child/entities/Child'

export class RegisterChild {
  constructor(private readonly children: IChildRepository) {}

  async execute(data: CreateChildInput): Promise<Child> {
    CreateChildInputSchema.parse(data)
    return this.children.create(data)
  }
}

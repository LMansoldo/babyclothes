const VALID_SIZES = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '6', '8'] as const;
type ValidSize = (typeof VALID_SIZES)[number];

export class ClothingSize {
  readonly value: string;

  constructor(value: string) {
    if (!(VALID_SIZES as readonly string[]).includes(value)) {
      throw new Error(`Invalid clothing size: ${value}`);
    }
    this.value = value;
  }

  validate(): boolean {
    return (VALID_SIZES as readonly string[]).includes(this.value);
  }

  next(): ClothingSize {
    const idx = VALID_SIZES.indexOf(this.value as ValidSize);
    const nextIdx = Math.min(idx + 1, VALID_SIZES.length - 1);
    return new ClothingSize(VALID_SIZES[nextIdx]);
  }
}

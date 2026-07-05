type ClassValue = string | number | null | undefined | false | ClassValue[] | Record<string, unknown>

const flatten = (input: ClassValue): string[] => {
  if (!input) return []
  if (typeof input === 'string' || typeof input === 'number') return [String(input)]
  if (Array.isArray(input)) return input.flatMap(flatten)
  return Object.entries(input)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(flatten).join(' ')
}

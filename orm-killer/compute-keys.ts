/**
 * @description
 * Generate array of keys (strings)
 * excluding some of them (all strings from second arg)
 * and optionally adding extra (each arg after second)
 */
export function computeKeysExcludingFrom<
  T extends object,
  R extends readonly (keyof T)[],
  A extends readonly string[]
>(obj: Required<Record<keyof Required<T>, null>>, rm: R, ...add: A) {
  const origin = new Set(Object.keys(obj));

  add.forEach((a) => origin.add(a));
  rm.forEach((r) => origin.delete(r as string));

  return Array.from(origin) as 'id' extends keyof T
    ? ['id', ...Exclude<keyof T | A[number], R[number]>[]]
    : Exclude<keyof T | A[number], R[number]>[];
}

/**
 * @description
 * Generate array of keys (strings)
 * including only from allowed (all strings from second arg)
 * and optionally adding extra (each arg after second)
 */
export function computeKeysIncludingFrom<
  T extends object,
  O extends readonly (keyof T)[],
  A extends readonly string[]
>(obj: Required<Record<keyof Required<T>, null>>, only: O, ...add: A) {
  return Array.from(new Set([...only, ...add])) as (O[number] | A[number])[];
}

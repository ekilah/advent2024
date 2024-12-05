/** Create a new Set from a given Set */
export const clone = <V>(s: Set<V>): Set<V> => new Set(s)

/** Get an Array of the values of a given Set */
export const values = <V>(s: Set<V>): Array<V> => {
  return Array.from(s.values())
}

/** Return a subset of a Set, where a pair is included in the new Set iff the predicate returns true for it. */
export function filter<V, V1 extends V>(
  predicate: (value: V) => value is V1,
  s: Set<V>
): Set<V1>
export function filter<V>(predicate: (value: V) => boolean, s: Set<V>): Set<V>
export function filter<V>(predicate: (value: V) => boolean, s: Set<V>): Set<V> {
  const filtered = new Set<V>()
  s.forEach((value: V) => {
    if (predicate(value)) {
      filtered.add(value)
    }
  })
  return filtered
}

/** Return a subset of a Set, where a value is excluded from the new Set iff the predicate returns true for it. */
export const reject = <V>(predicate: (value: V) => boolean, s: Set<V>): Set<V> => {
  return filter(v => !predicate(v), s)
}

/** Sets are iterated in insertion order. This method returns the first-inserted element of the Set. */
export const first = <V>(s: Set<V>): V | undefined => {
  return atIndex(0, s)
}

/** Sets are iterated in insertion order. This method returns the last-inserted element of the Set. */
export const last = <V>(s: Set<V>): V | undefined => {
  return atIndex(s.size - 1, s)
}

/** Sets are iterated in insertion order. This method returns the element of the Set at the specified array index. */
export const atIndex = <V>(index: number, s: Set<V>): V | undefined => {
  return s.size > index && index >= 0 ? values(s)[index] : undefined
}

/** Returns the intersection between two sets. The order of the first set is preserved. */
export function intersection<V1, V2 extends V1>(
  s1: Set<V1>,
  s2: Set<V2>
): Set<V1 & V2>
export function intersection<V1 extends V2, V2>(
  s1: Set<V1>,
  s2: Set<V2>
): Set<V1 & V2>
export function intersection<V>(s1: Set<V>, s2: Set<V>): Set<V>
export function intersection<V1, V2>(s1: Set<V1>, s2: Set<V2>): Set<V1 & V2> {
  const i = new Set<V1 & V2>()
  s1.forEach(v => {
    if (has(v, s2)) {
      i.add(v)
    }
  })
  return i
}

/** Returns true iff the intersection between two sets is nonempty */
export const intersects = <V>(s1: Set<V>, s2: Set<V>): boolean => {
  return nonempty(intersection(s1, s2))
}

export const empty = (s: Set<any>) => s.size === 0
export const nonempty = (s: Set<any>) => !empty(s)

type SameValueZeroPrimitive = string | number | bigint | boolean | symbol

/* Add an element to a Set. Unlike Set.prototype.add, this does not mutate the given Set. */
export const add = <V>(elementToAdd: V, s: Set<V>): Set<V> => {
  const dupe = clone(s)
  return dupe.add(elementToAdd)
}

/** (A - B), preserving the order of A after removing elements in B */
export const difference = <T>(A: Set<T>, B: Set<any>): Set<T> => {
  // "reject everything that B has from A"
  return reject(elem => B.has(elem), A)
}

/**
 *  Like Set.has(), but can accept any type, instead of `Set.has()` which requires the value to check is of type T.
 *  Also returns `val is T` so you can assert that, if the value is in the set,
 *  it is indeed of the expected type
 */
export const has = <T>(val: any, s: Set<T>): val is T => {
  return s.has(val)
}

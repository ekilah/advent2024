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

/** (A - B), preserving the order of A after removing elements in B */
export const difference = <T>(A: Set<T>, B: Set<any>): Set<T> => {
  // "reject everything that B has from A"
  return reject(elem => B.has(elem), A)
}

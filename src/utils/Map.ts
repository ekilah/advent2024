/** Get an Array of the values of a given Map */
export const values = <V>(m: Map<any, V>): Array<V> => {
  return Array.from(m.values())
}

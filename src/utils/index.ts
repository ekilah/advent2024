import * as RA from 'ramda-adjunct'
/**
 * Remove all falsey values from a list. 0, '', false, undefined, and null will be removed.
 * (RA's compact isn't typed nicely for uniform lists. This wrapper is.)
 */
export const compact = <T>(
  list: Array<T>
): Array<NonNullable<Exclude<T, 0 | '' | false>>> => {
  return RA.compact(list)
}

/** Given a list, returns a Map whose keys are the members of the list, and the values are the number of times each list member appeared in the list. */
export const listToOccurrenceCountMap = <T>(list: T[]): Map<T, number> => {
  const returnVal = new Map<T, number>()

  list.forEach(t => {
    const currentCount = (returnVal.get(t) ?? 0) + 1
    returnVal.set(t, currentCount)
  })
  return returnVal
}

export const findIndices = <T>(predicate: (item: T) => boolean, list: T[]): number[] => {
  const indicesOrUndefined = list.map((t, idx) => predicate(t) ? idx : undefined)
  return indicesOrUndefined.filter(t => t !== undefined)
}

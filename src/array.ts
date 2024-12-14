/**
 * Overload for Array.prototype.map to support returning a tuple type if it is called on a tuple type.
 * Reference: https://stackoverflow.com/a/65340056
 */

interface Array<T> {
  map<U>(callbackfn: (value: T, index: number, tuple: T[] | [T]) => U, thisArg?: any): {[K in keyof this]: U}
}

interface ReadonlyArray<T> {
  map<U>(callbackfn: (value: T, index: number, array: readonly T[] | [T]) => U, thisArg?: any): {[K in keyof this]: U};
}

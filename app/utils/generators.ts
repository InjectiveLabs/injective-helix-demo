export const mapKeys = <T, V, U>(
  m: Map<T, V>,
  fn: (this: void, v: V) => U
): Map<T, U> => {
  function transformPair([k, v]: [T, V]): [T, U] {
    return [k, fn(v)]
  }

  return new Map(Array.from(m.entries(), transformPair))
}

export const uniqueId = (characters: number = 6): string =>
  (
    Number(String(Math.random()).slice(2)) +
    Date.now() +
    Math.round(performance.now())
  ).toString(characters)

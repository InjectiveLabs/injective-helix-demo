export interface ConcreteDataIntegrityStrategy<T, R> {
  args: T
  validate(args: T): Promise<void>
  verifyData(localData: R | R[], fetchedData: R | R[]): boolean
  fetchData(args: T): Promise<R | R[] | undefined>
}

export type MarketIdsArgs = string[] | undefined

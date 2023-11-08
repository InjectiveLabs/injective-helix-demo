export interface ConcreteDataIntegrityStrategy<T, R> {
  args: T
  validate(args: T): Promise<void>
  verifyData(localData: R | R[], fetchedData: R | R[]): boolean
}

export type MarketIdsArgs = string[] | undefined

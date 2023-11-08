export interface ConcreteDataIntegrityStrategy {
  validate(marketIds: string[] | undefined): Promise<void>
  verifyData(localData: any, fetchedData: any): boolean
}

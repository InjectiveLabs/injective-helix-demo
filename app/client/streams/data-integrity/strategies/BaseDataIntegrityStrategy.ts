export abstract class BaseDataIntegrityStrategy {
  abstract validate(marketIds: string[] | undefined): Promise<void>
  abstract verifyData(localData: any, fetchedData: any): boolean
}

import { OracleType, OracleTypeMap } from '@injectivelabs/sdk-ts'

export class UiOracleTransformer {
  static grpcOracleTypeToUiOracleType(grpcOracleType: string): OracleType {
    switch (grpcOracleType.toLowerCase()) {
      case 'coinbase':
        return OracleTypeMap.Coinbase
      case 'bandibc':
        return OracleTypeMap.BandIBC
      case 'pricefeed':
        return OracleTypeMap.PriceFeed
      case 'band':
        return OracleTypeMap.Band
      case 'api3':
        return OracleTypeMap.API3
      case 'razor':
        return OracleTypeMap.Razor
      case 'dia':
        return OracleTypeMap.Dia
      case 'uma':
        return OracleTypeMap.Uma
      case 'chainlink':
        return OracleTypeMap.Chainlink
      case 'pyth':
        return OracleTypeMap.Pyth
      case 'provider':
        return OracleTypeMap.Provider
      default:
        return OracleTypeMap.Coinbase
    }
  }
}

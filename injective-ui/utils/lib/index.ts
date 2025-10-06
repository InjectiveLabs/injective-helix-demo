export * from './utils'

export type AlchemyType = typeof import('alchemy-sdk').Alchemy
export type EthersSigningType = typeof import('ethers').SigningKey
export type EthersBaseWalletType = typeof import('ethers').BaseWallet
export type SigUtilSignedTypedData =
  typeof import('@metamask/eth-sig-util').signTypedData

let AlchemyType: AlchemyType
let EthersSigningType: EthersSigningType
let EthersBaseWalletType: EthersBaseWalletType
let SigUtilSignedTypedData: SigUtilSignedTypedData

export async function loadAlchemyType(): Promise<typeof AlchemyType> {
  if (!AlchemyType) {
    const module = await import('alchemy-sdk')
    AlchemyType = module.Alchemy
      ? module.Alchemy
      : (module as any).default.Alchemy
  }

  return AlchemyType
}

export async function loadEthersSigningType(): Promise<
  typeof EthersSigningType
> {
  if (!EthersSigningType) {
    const module = await import('ethers')
    EthersSigningType = module.SigningKey
      ? module.SigningKey
      : (module as any).default.SigningKey
  }

  return EthersSigningType
}

export async function loadEthersBaseWalletType(): Promise<
  typeof EthersBaseWalletType
> {
  if (!EthersBaseWalletType) {
    const module = await import('ethers')
    EthersBaseWalletType = module.BaseWallet
      ? module.BaseWallet
      : (module as any).default.BaseWallet
  }

  return EthersBaseWalletType
}

export async function loadSigUtilSignedTypedData(): Promise<
  typeof SigUtilSignedTypedData
> {
  if (!SigUtilSignedTypedData) {
    const module = await import('@metamask/eth-sig-util')
    SigUtilSignedTypedData = module.signTypedData
      ? module.signTypedData
      : (module as any).default.signTypedData
  }

  return SigUtilSignedTypedData
}

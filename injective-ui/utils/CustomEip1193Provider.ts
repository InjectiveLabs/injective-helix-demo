import {
  loadEthersSigningType,
  loadEthersBaseWalletType,
  loadSigUtilSignedTypedData
} from './../utils/lib'
import type { BaseWallet, Eip1193Provider } from 'ethers'

const SEPOLIA_CHAIN_ID = 11155111

const methodMap: Record<
  string,
  (
    params: any,
    pk: string,
    baseWallet: BaseWallet,
    provider: CustomEip1193Provider
  ) => Promise<any>
> = {
  eth_requestAccounts: async (_method, _params, _baseWallet) => {
    return [_baseWallet.address]
  },
  eth_signTypedData_v4: async (params, pk) => {
    const signTypedData = await loadSigUtilSignedTypedData()
    const _pk = pk.slice(2)

    const [_address, typedData] = params

    const typedDataObj = JSON.parse(typedData) as any

    const { domain, types, message, primaryType } = typedDataObj

    const signature = signTypedData({
      data: { domain, message, primaryType, types },
      privateKey: Buffer.from(_pk, 'hex'),
      version: 'v4' as any
    })

    return signature
  },
  eth_chainId: async (_method, _params, _baseWallet, _provider) => {
    return '0x' + _provider.chainId.toString(16)
  },
  wallet_switchEthereumChain: async (
    _method,
    _params,
    _baseWallet,
    _provider
  ) => {
    const [chainId] = _params

    const chainIdObj = JSON.parse(chainId) as any

    const chainIdInt = parseInt(chainIdObj.chainId, 16)

    _provider.chainId = chainIdInt
  }
}

export class CustomEip1193Provider implements Eip1193Provider {
  isMetaMask: boolean
  chainId: number

  private baseWallet: undefined | BaseWallet
  private pk: string | undefined

  constructor(chainId: number = SEPOLIA_CHAIN_ID) {
    this.isMetaMask = true

    this.chainId = chainId

    const windowOrGlobal =
      typeof window !== 'undefined' ? window : (globalThis as any)

    windowOrGlobal.setPrivateKey = this.setPrivateKey.bind(this)
  }

  async request({ method, params }: { params?: any; method: string }) {
    if (!this.pk || !this.baseWallet) {
      throw new Error('Private key not set')
    }

    if (method in methodMap) {
      return methodMap[method](params, this.pk, this.baseWallet, this)
    }

    throw new Error(`Method ${method} not found`)
  }

  async setPrivateKey(pk: string) {
    const SigningKey = await loadEthersSigningType()
    const BaseWallet = await loadEthersBaseWalletType()

    this.pk = pk

    const signingKey = new SigningKey(pk)
    this.baseWallet = new BaseWallet(signingKey)
  }
}

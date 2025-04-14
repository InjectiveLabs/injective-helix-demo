import { HttpClient } from '@injectivelabs/utils'
import { IS_MAINNET, IS_PRODUCTION } from '@shared/utils/constant'
import { FAUCET_ENDPOINT } from '@/app/utils/constants'

const endpoint =
  IS_MAINNET && IS_PRODUCTION
    ? 'https://products.web3-gateway.injective.network/api'
    : '' // todo: waiting for the devops team to confirm on this endpoints for other env

export const web3GatewayHealthCheck = async () => {
  const sharedWalletStore = useSharedWalletStore()

  if (!endpoint) {
    return
  }

  const response = (await new HttpClient(FAUCET_ENDPOINT).get(
    'health/v1/status'
  )) as { data: { status: boolean } }

  sharedWalletStore.isEip712 = response.data.status
}

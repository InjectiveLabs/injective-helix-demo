import { GrpcValidator, StakingComposer } from '@injectivelabs/chain-consumer'
import { Web3Exception } from '@injectivelabs/exceptions'
import { metricsProvider } from '../providers/MetricsProvider'
import { validatorsToUiValidators } from '../transformers/staking'
import { stakingConsumer } from '../singletons/StakingConsumer'
import { CHAIN_ID, INJECTIVE_DENOM } from '../utils/constants'
import { TxProvider } from '../providers/TxProvider'
import { UiValidator } from '~/types/validators'
import { ChainMetrics } from '~/types/metrics'

export const fetchValidator = async (
  validatorAddress: string
): Promise<UiValidator> => {
  const promise = stakingConsumer.fetchValidator(validatorAddress)
  const grpcValidator = (await metricsProvider.sendAndRecord(
    promise,
    ChainMetrics.FetchValidator
  )) as GrpcValidator

  const [uiValidator] = validatorsToUiValidators([grpcValidator])

  return uiValidator
}

export const delegate = async ({
  address,
  injectiveAddress,
  validatorAddress,
  amount
}: {
  amount: string
  address: string
  validatorAddress: string
  injectiveAddress: string
}) => {
  const message = StakingComposer.delegate({
    validatorAddress,
    injectiveAddress,
    amount,
    denom: INJECTIVE_DENOM
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: ChainMetrics.Delegate,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error: any) {
    throw new Web3Exception(error.message)
  }
}

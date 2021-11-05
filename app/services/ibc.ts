import { ibcConsumer } from '../singletons/IbcConsumer'

export const fetchDenomTrace = async (denom: string) => {
  const hash = denom.replace('ibc/', '')
  const denomTrace = await ibcConsumer.fetchDenomTrace(hash)

  if (!denomTrace) {
    throw new Error(`Denom trace not found for ${denom}`)
  }

  return {
    path: denomTrace.getPath(),
    baseDenom: denomTrace.getBaseDenom()
  }
}

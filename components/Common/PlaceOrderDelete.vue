<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { addSubacountIdToEthAddress } from '@/app/utils/helpers'
import { stringToHex } from '@/app/utils/converters'

const accountStore = useAccountStore()
const tokenStore = useTokenStore()
const token = computed(() =>
  tokenStore.tradeableTokens.find((t) => t.denom === 'inj')
)

function handleOrder() {
  const ethAddress = '0xbdaedec95d563fb05240d6e01821008454c24c36'

  accountStore.deposit({
    amount: new BigNumberInBase(1),
    subaccountId: addSubacountIdToEthAddress(
      ethAddress,
      stringToHex('inj-usdt')
    ),
    token: token.value!
  })
}
</script>

<template>
  <button @click="handleOrder">Place Order</button>
</template>

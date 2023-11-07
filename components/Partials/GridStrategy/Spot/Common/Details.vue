<script setup lang="ts">
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'

const router = useRouter()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

function detailsPageChange() {
  router.push({ name: 'activity-spot' })

  accountStore.$patch({
    subaccountId: addressAndMarketSlugToSubaccountId(
      walletStore.address,
      gridStrategyStore.spotMarket?.slug || 'inj-usdt'
    )
  })
}
</script>

<template>
  <slot v-bind="{ detailsPageChange }" />
</template>

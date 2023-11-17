<script lang="ts" setup>
import { addressAndMarketSlugToSubaccountId } from '@/app/utils/helpers'
import { ActivitySubPage } from '@/types'

const router = useRouter()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

function detailsPageChange() {
  router.push({ name: ActivitySubPage.Spot })

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

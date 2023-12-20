<script lang="ts" setup>
import { StatusType, Status } from '@injectivelabs/utils'

const props = defineProps({
  search: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

function searchMarketsOnChain() {
  if (!props.search) {
    return
  }

  status.setLoading()

  exchangeStore
    .fetchMarketsFromTicker(props.search)
    .then(({ spotMarketIds, derivativeMarketIds }) => {
      if (spotMarketIds.length !== 0) {
        const [marketId] =
          spotMarketIds /** TODO: if there are multiple markets */

        return router.push(`/spot/?marketId=${marketId}`)
      }

      if (derivativeMarketIds.length !== 0) {
        const [marketId] =
          derivativeMarketIds /** TODO: if there are multiple markets */

        return router.push(`/futures/?marketId=${marketId}`)
      }
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <AppHocLoading v-bind="{ status }">
    <span
      class="flex items-center justify-center"
      @click="searchMarketsOnChain"
    >
      {{ $t('markets.emptyDescription') }}
      <BaseIcon name="search" class="text-primary-500 w-8 h-8 ml-2" />
    </span>
  </AppHocLoading>
</template>

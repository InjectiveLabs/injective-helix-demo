<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const referralStore = useReferralStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

function fetchOrders() {
  status.setLoading()

  Promise.all([
    derivativeStore.fetchSubaccountOrders(),
    referralStore.fetchUserReferralDetails(),
    derivativeStore.fetchSubaccountConditionalOrders()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

onSubaccountChange(fetchOrders)
</script>

<template>
  <div>
    <div class="p-4">
      <p class="portfolio-title">{{ $t('portfolio.positions') }}</p>
      <p class="text-coolGray-300 mt-8 font-medium">
        {{ $t('portfolio.positions') }}
      </p>
    </div>

    <div class="border-y divide-y">
      <CommonSkeletonRow
        v-if="status.isLoading()"
        :rows="10"
        :columns="12"
        :height="57"
      />

      <PartialsPortfolioPositions v-else />
    </div>
  </div>
</template>

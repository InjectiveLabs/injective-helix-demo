<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

function fetchData() {
  status.setLoading()

  Promise.all([
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountConditionalOrders()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

onSubaccountChange(fetchData)
</script>

<template>
  <div>
    <div class="p-4">
      <p class="portfolio-title">{{ $t('activity.positions') }}</p>
      <p class="text-coolGray-300 mt-8 font-medium">
        {{ $t('activity.positions') }}
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

<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'

defineProps({
  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Loading)
  }
})

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const { $onError } = useNuxtApp()

const positions = computed(() => {
  return positionStore.subaccountPositions
})

onMounted(() => {
  Promise.all([
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountConditionalOrders()
  ]).catch($onError)
})
</script>

<template>
  <AppHocLoading
    :status="status"
    :loader-class="status.isLoading() ? 'relative' : ''"
  >
    <div class="w-full h-full-flex">
      <!-- mobile table -->
      <CommonTableBody
        :show-empty="positions.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <PartialsCommonSubaccountPositionMobile
          v-for="(position, index) in positions"
          :key="`mobile-positions-${index}-${position.marketId}`"
          class="col-span-1"
          :position="position"
        />

        <template #empty>
          <CommonEmptyList
            :message="$t('trade.emptyPositions')"
            class="pb-4 grow bg-gray-900"
          />
        </template>
      </CommonTableBody>

      <CommonTableWrapper break-md class="hidden sm:block">
        <table v-if="positions.length > 0" class="table">
          <PartialsCommonSubaccountPositionHeader />
          <tbody>
            <PartialsCommonSubaccountPositionRow
              v-for="(position, index) in positions"
              :key="`positions-${index}-${position.marketId}`"
              :position="position"
            />
          </tbody>
        </table>

        <CommonEmptyList
          v-else
          data-cy="universal-table-nothing-found"
          :message="$t('trade.emptyPositions')"
          class="pb-4 grow"
        />
      </CommonTableWrapper>
    </div>
  </AppHocLoading>
</template>

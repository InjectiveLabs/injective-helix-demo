<script lang="ts" setup>
import { PropType } from 'vue'
import { GeneralException } from '@injectivelabs/exceptions'
import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'

const derivativeStore = useDerivativeStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const props = defineProps({
  denoms: {
    type: Array as PropType<string[]>,
    default: () => []
  },

  side: {
    type: String,
    default: ''
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Loading)
  }
})

const tabCountElement = document.getElementById(
  'activity-position-tab-count-default'
)
const actionStatus = reactive(new Status(StatusType.Idle))

const markets = computed(() =>
  derivativeStore.markets
    .filter((m) =>
      props.denoms.some((denom) =>
        [m.baseToken.denom, m.quoteDenom].includes(denom)
      )
    )
    .map(({ marketId }) => marketId)
)

const filteredPositions = computed(() =>
  positionStore.subaccountPositions.filter((position) => {
    const positionMatchesSide = !props.side || props.side === position.direction
    const positionMatchesMarket =
      markets.value.length === 0 || markets.value.includes(position.marketId)

    return positionMatchesSide && positionMatchesMarket
  })
)

onMounted(() => tabCountElement?.classList.add('hidden'))
onUnmounted(() => tabCountElement?.classList.remove('hidden'))

function closePosition(position: UiPosition) {
  const market = derivativeStore.markets.find(
    (m) => m.marketId === position.marketId
  )

  if (!market) {
    return Promise.reject(
      new GeneralException(
        Error(
          t('trade.position_market_not_found', {
            marketId: position.marketId
          })
        )
      )
    )
  }

  return positionStore.closePosition({ position, market })
}

function handleClosePositions() {
  actionStatus.setLoading()

  const action =
    filteredPositions.value.length === 1
      ? closePosition(filteredPositions.value[0])
      : positionStore.closeAllPosition(filteredPositions.value)

  action
    .then(() => {
      success({
        title: t('trade.positions_closed')
      })
    })
    .catch($onError)
    .finally(() => {
      actionStatus.setIdle()
    })
}
</script>

<template>
  <div>
    <Teleport to="#activity-position-tab-count">
      <span>({{ filteredPositions.length }})</span>
    </Teleport>

    <Teleport to="#activity-toolbar-action">
      <AppButton
        v-if="filteredPositions.length > 0"
        class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
        :status="actionStatus"
        data-cy="activity-cancel-all-button"
        :disabled="!accountStore.isDefaultSubaccount"
        @click="handleClosePositions"
      >
        <span class="whitespace-nowrap">
          {{ $t('trade.closeAllPositions') }}
        </span>
      </AppButton>
    </Teleport>

    <AppHocLoading
      class="h-full"
      :status="status"
      :loader-class="status.isLoading() ? 'relative' : ''"
    >
      <div class="w-full h-full">
        <!-- mobile table -->
        <CommonTableBody
          :show-empty="filteredPositions.length === 0"
          class="sm:hidden mt-3 max-h-lg overflow-y-auto"
        >
          <PartialsCommonSubaccountPositionMobile
            v-for="(position, index) in filteredPositions"
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
          <table v-if="filteredPositions.length > 0" class="table">
            <PartialsCommonSubaccountPositionHeader />
            <tbody>
              <PartialsCommonSubaccountPositionRow
                v-for="(position, index) in filteredPositions"
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
  </div>
</template>

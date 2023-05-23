<script lang="ts" setup>
import { PropType } from 'vue'
import { GeneralException } from '@injectivelabs/exceptions'
import { UiPosition } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityForm, ActivityField, Modal, ActivityPage } from '@/types'

const modalStore = useModalStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { success } = useNotifications()

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

const formValues = useFormValues<ActivityForm>()

const actionStatus = reactive(new Status(StatusType.Idle))
const selectedPosition = ref<UiPosition | undefined>(undefined)

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
    const positionMatchesSide =
      !formValues.value[ActivityField.Side] ||
      formValues.value[ActivityField.Side] === position.direction
    const positionMatchesMarket =
      markets.value.length === 0 || markets.value.includes(position.marketId)

    return positionMatchesSide && positionMatchesMarket
  })
)

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

function handleSharePosition(position: UiPosition) {
  selectedPosition.value = position
  modalStore.openModal({ type: Modal.SharePosition })
}
</script>

<template>
  <div>
    <ClientOnly>
      <Teleport to="#activity-toolbar-action">
        <AppButton
          v-if="filteredPositions.length > 0"
          class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
          :status="actionStatus"
          data-cy="activity-cancel-all-button"
          @click="handleClosePositions"
        >
          <span class="whitespace-nowrap">
            {{ $t('trade.closeAllPositions') }}
          </span>
        </AppButton>
      </Teleport>

      <Teleport :to="`#${ActivityPage.OpenPositions}`">
        <span class="ml-1">({{ filteredPositions.length }})</span>
      </Teleport>
    </ClientOnly>

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
          v-bind="{
            position
          }"
          @share:position="handleSharePosition"
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
              @share:position="handleSharePosition"
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

    <ModalsSharePosition
      v-if="selectedPosition"
      v-bind="{ position: selectedPosition }"
    />
  </div>
</template>

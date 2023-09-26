<script setup lang="ts">
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import { AuctionTradingField, AuctionTradingForm, Modal } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  }
})

const spotStore = useSpotStore()
const modalStore = useModalStore()
const formValues = useFormValues<AuctionTradingForm>()
const { success, error } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const { valueToString: quoteAmountToString } = useBigNumberFormatter(
  computed(() => formValues.value[AuctionTradingField.BidPrice]),
  { decimalPlaces: 2 }
)

function closeModal() {
  modalStore.closeModal(Modal.BidConfirm)
}

function handleBid() {
  status.setLoading()

  spotStore
    .submitLimitOrder({
      market: props.market,
      price: new BigNumberInBase(
        formValues.value[AuctionTradingField.BidPrice] || 0
      ),
      quantity: new BigNumberInBase(
        formValues.value[AuctionTradingField.BaseAmount] || 0
      ),
      orderSide: OrderSide.Buy
    })
    .then(() => {
      success({ title: t('success'), description: t('auction.bidCreated') })
    })
    .finally(() => {
      status.setIdle()
      closeModal()
    })
    .catch((e) => {
      $onError(e)
      error({ title: t('error'), description: t('somethingHappened') })
    })
}
</script>

<template>
  <AppModal
    :show="modalStore.modals[Modal.BidConfirm]"
    sm
    @modal:closed="closeModal"
  >
    <template #title>
      <h3>Confirm</h3>
    </template>

    <AppHocLoading v-bind="{ status }">
      <div>
        <p class="pb-6">
          A new bid to purchase
          <span class="font-semibold">{{
            formValues[AuctionTradingField.BaseAmount]
          }}</span>
          DEMO will be placed at price
          <span class="font-semibold">{{ quoteAmountToString }} USDT</span>.
        </p>
        <AppButton
          class="w-full bg-blue-400 text-white rounded-md font-semibold"
          @click="handleBid"
        >
          {{ $t('confirm') }}
        </AppButton>
      </div>
    </AppHocLoading>
  </AppModal>
</template>

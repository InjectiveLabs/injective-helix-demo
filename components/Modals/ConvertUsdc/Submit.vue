<script lang="ts" setup>
import { PropType } from 'vue'
import { ZERO_IN_BASE, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { Modal, TradeField, TradeForm } from '@/types'
import { tradeErrorMessages } from '@/app/client/utils/validation/trade'

const router = useRouter()
const modalStore = useModalStore()
const walletStore = useWalletStore()

const formErrors = useFormErrors()
const formValues = useFormValues<TradeForm>()

const props = defineProps({
  isBuy: Boolean,

  fee: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  amount: {
    type: String,
    default: ''
  },

  minimalReceived: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiSpotMarketWithToken>,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    required: true
  }
})

const emit = defineEmits<{
  'form:submit': []
}>()

const { insufficientLiquidity, highDeviation } = useSpotError({
  formValues,
  executionPrice: computed(() => props.executionPrice),
  isBuy: computed(() => props.isBuy),
  market: computed(() => props.market)
})

const hasFormErrors = computed(
  () =>
    Object.keys(formErrors.value).filter(
      (key) => ![TradeField.SlippageTolerance].includes(key as TradeField)
    ).length > 0
)

const isSubmitDisabled = computed<boolean>(() => {
  return (
    hasFormErrors.value || props.amount === '' || insufficientLiquidity.value
  )
})

const hasInsufficientBalance = computed(() =>
  Object.values(formErrors.value).includes(
    tradeErrorMessages.insufficientBalance()
  )
)

function handleConnect() {
  modalStore.openModal(Modal.Connect)
}

function submit() {
  emit('form:submit')
}

function handleNavigation() {
  if (modalStore.modals[Modal.ConvertUsdc]) {
    modalStore.closeModal(Modal.ConvertUsdc)
  }

  router.push({ name: 'account' })
}
</script>

<template>
  <div class="w-full">
    <AppButton
      v-if="!walletStore.isUserWalletConnected"
      lg
      class="w-full bg-blue-500 text-blue-900 font-semibold"
      @click="handleConnect"
    >
      {{ $t('trade.swap.connect_wallet') }}
    </AppButton>

    <AppButton
      v-else
      class="w-full bg-blue-500 text-blue-900 font-semibold"
      lg
      :disabled="isSubmitDisabled"
      :is-loading="status.isLoading()"
      @click="submit"
    >
      <div class="max-auto w-full">
        <span v-if="insufficientLiquidity">
          {{ $t('trade.swap.insufficient_liquidity') }}
        </span>
        <span v-else>{{ $t('trade.swap.convert') }}</span>
      </div>
    </AppButton>

    <p v-if="highDeviation" class="text-red-500 text-sm mt-4">
      {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
    </p>

    <p v-if="hasInsufficientBalance" class="text-red-500 text-sm mt-4">
      <span class="mr-1">
        {{
          $t('trade.swap.insufficient_balance_verbose', {
            symbol: isBuy ? market?.quoteToken.symbol : market?.baseToken.symbol
          })
        }}
      </span>
      <span class="text-blue-600" @click="handleNavigation">
        {{ $t('trade.swap.goToAccount') }}
      </span>
    </p>
  </div>
</template>

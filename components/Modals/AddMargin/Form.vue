<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '@/app/utils/constants'

const positionStore = usePositionStore()
const { t } = useLang()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { handleSubmit, resetForm } = useForm()

const props = defineProps({
  balance: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const status = reactive(new Status(StatusType.Idle))

const {
  valueToBigNumber: availableMargin,
  valueToFixed: availableMarginToFixed,
  valueToString: availableMarginToString
} = useBigNumberFormatter(
  computed(() => props.balance),
  { decimalPlaces: UI_DEFAULT_PRICE_DISPLAY_DECIMALS }
)

const {
  value: amountValue,
  errors: amountErrors,
  setValue: setAmountValue
} = useStringField({
  name: 'amount',
  rule: 'required|positiveNumber',
  dynamicRule: computed(() => `between:0.001,${availableMarginToFixed.value}`)
})

function handleMax() {
  setAmountValue(availableMarginToFixed.value)
}

const submit = handleSubmit(() => {
  status.setLoading()

  positionStore
    .addMarginToPosition({
      market: props.market,
      amount: new BigNumberInBase(amountValue.value)
    })
    .then(() => {
      resetForm()
      success({ title: t('trade.success_added_margin') })

      emit('close')
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <div>
    <div class="text-center">
      <div class="flex items-center justify-center">
        <p class="uppercase text-xs font-semibold text-gray-200">
          {{ $t('trade.availableMargin') }}
        </p>
        <CommonInfoTooltip
          class="ml-2 text-gray-200"
          :tooltip="$t('trade.availableMarginTooltip')"
        />
      </div>
      <div class="mt-4 text-center">
        <span
          class="font-mono flex items-center justify-center text-gray-200 text-base lg:text-xl"
          data-cy="add-margin-modal-available-text-content"
        >
          {{ availableMarginToString }}
          <span class="text-gray-500 ml-2">{{ market.quoteToken.symbol }}</span>
        </span>
      </div>
    </div>

    <div class="mt-4">
      <div class="flex flex-wrap">
        <div class="w-full">
          <AppInputNumeric
            v-model="amountValue"
            :errors="status.isLoading() ? [] : amountErrors"
            :max="availableMarginToString"
            :max-selector="availableMargin.gt(0.01)"
            :label="$t('trade.amount')"
            :placeholder="$t('trade.enter_your_amount')"
            class="no-shadow"
            step="0.001"
            data-cy="add-margin-modal-amount-input"
          >
            <template #max>
              <AppButton
                xs
                class="bg-blue-500 text-blue-900"
                @click="handleMax"
              >
                {{ $t('trade.max') }}
              </AppButton>
            </template>

            <template #addon>
              {{ market.quoteToken.symbol }}
            </template>
          </AppInputNumeric>

          <p
            v-if="amountErrors.length > 0"
            class="capitalize-phrase text-red-500 text-sm mt-2"
          >
            {{ amountErrors[0] }}
          </p>
        </div>
        <div class="w-full mt-6 text-center">
          <AppButton
            lg
            class="w-full bg-blue-500 text-blue-900"
            :disabled="amountErrors.length > 0"
            :status="status"
            data-cy="add-margin-modal-execute-button"
            @click="submit"
          >
            {{ $t('trade.add_margin') }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Dropdown, Tooltip } from 'floating-vue'
import { onClickOutside } from '@vueuse/core'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeField } from '@/types'
import { MAX_SLIPPAGE } from '@/app/utils/constants'

const popperRef = ref(null)
const dropdownRef = ref(null)
const hasError = ref(false)
const isOpen = ref(false)
const slippageList = ['0.1', '0.5', '1.0']

const appIconColorClass = computed<string>(() => {
  if (slippageError.value) {
    return 'text-red-500'
  }

  return isOpen.value ? 'text-blue-500' : 'text-gray-500'
})

const {
  value: slippageTolerance,
  errors: slippageToleranceErrors,
  setValue: setSlippageToleranceValue
} = useStringField({
  name: TradeField.SlippageTolerance,
  initialValue: '0.5',
  rule: 'required|slippage'
})

const slippageError = computed(() => slippageToleranceErrors.value[0])

onClickOutside(
  popperRef,
  () => {
    isOpen.value = false
  },
  {
    ignore: [dropdownRef]
  }
)

function toggleSlippageDropdown() {
  isOpen.value = !isOpen.value
}

function checkForInvalidSlippageValue() {
  const slippageValue = new BigNumberInBase(slippageTolerance.value || 0)

  if (slippageValue.lte(0)) {
    setSlippageToleranceValue('0.5')
  }

  if (slippageValue.gt(MAX_SLIPPAGE)) {
    setSlippageToleranceValue(MAX_SLIPPAGE.toFormat(1))
  }
}
</script>

<template>
  <Tooltip
    popper-class="tooltip"
    :triggers="[]"
    :disabled="isOpen"
    :shown="!isOpen && slippageError !== undefined"
  >
    <Dropdown
      ref="dropdownRef"
      popper-class="slippage"
      placement="bottom-end"
      :distance="6"
      :triggers="[]"
      :shown="isOpen"
      :auto-hide="false"
    >
      <BaseIcon
        name="gear"
        class="h-5 w-5 hover:text-blue-500"
        :class="appIconColorClass"
        @click="toggleSlippageDropdown"
      />

      <template #popper>
        <div ref="popperRef" class="p-4 bg-gray-800 text-white">
          <h3 class="text-xs font-bold uppercase tracking-widest">
            {{ $t('trade.convert.advancedSettings') }}
          </h3>
          <div class="my-4 flex items-center gap-2">
            <span class="text-xs">{{ $t('trade.convert.tolerance') }}</span>
            <AppInfoTooltip sm :tooltip="$t('trade.convert.tooltip')" />
          </div>

          <div class="flex items-center gap-2 max-xs:flex-wrap">
            <div class="flex items-center gap-2 max-xs:w-full">
              <AppSelectButton
                v-for="slippage in slippageList"
                :key="`slippage-selector-item-${slippage}`"
                v-model="slippageTolerance"
                :value="slippage"
              >
                <template #default="{ active }">
                  <AppButton
                    sm
                    class="w-full border-blue-500 border"
                    :class="[
                      active
                        ? 'bg-blue-500 text-white rounded'
                        : 'text-blue-500 rounded'
                    ]"
                  >
                    <div class="mx-auto leading-4">
                      <span class="text-base capitalize">{{ slippage }}</span>
                      <span>%</span>
                    </div>
                  </AppButton>
                </template>
              </AppSelectButton>
            </div>

            <AppNumericInput
              v-model="slippageTolerance"
              class="ml-auto"
              input-classes="text-right"
              :error="hasError"
              sm
              @blur="checkForInvalidSlippageValue"
            >
              <template v-if="slippageError !== undefined" #prefix>
                <BaseIcon name="warn" class="min-w-4 text-red-500 h-4 w-4" />
              </template>

              <template #addon>
                <span class="text-gray-500">%</span>
              </template>
            </AppNumericInput>
          </div>

          <p v-if="slippageError" class="text-red-500 mt-4 text-sm">
            {{ slippageError }}
          </p>
        </div>
      </template>
    </Dropdown>

    <template #popper>
      {{ $t(`trade.convert.warnings.${slippageError}`) }}
    </template>
  </Tooltip>
</template>

<style>
/*
Todo: add scoped tag once nuxt resolve webpack style loader issue
  https://github.com/nuxt/framework/issues/7194
*/

.slippage.v-popper--theme-dropdown {
  width: calc(90% - 48px);
  max-width: 400px;
}

.slippage.v-popper--theme-dropdown .v-popper__inner {
  @apply border-none bg-transparent shadow-sm;
}
</style>

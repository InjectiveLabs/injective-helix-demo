<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE } from '@/app/utils/constants'
import { SwapFormField, SwapCyTags } from '@/types'

const dropdownRef = ref<null | { isOpen: boolean }>(null)
const slippageList = ['0.1', '0.5', '1.0']

const isOpen = computed(() => {
  if (!dropdownRef.value) {
    return false
  }

  return dropdownRef.value?.isOpen
})

const {
  value: slippageTolerance,
  errors: slippageToleranceErrors,
  setValue: setSlippageToleranceValue
} = useStringField({
  name: SwapFormField.Slippage,
  initialValue: '0.5',
  rule: 'slippage'
})

const slippageError = computed(() => {
  if (slippageToleranceErrors.value.length === 0) {
    return undefined
  }

  return slippageToleranceErrors.value[0]
})

function checkForInvalidSlippageValue() {
  const slippageValue = new BigNumberInBase(slippageTolerance.value || 0)

  if (slippageValue.lt(0)) {
    setSlippageToleranceValue('0.5')
  }

  if (slippageValue.gt(MAX_SLIPPAGE)) {
    setSlippageToleranceValue(MAX_SLIPPAGE.toFormat(0))
  }
}
</script>

<template>
  <AppTooltip
    :triggers="[]"
    :disabled="isOpen"
    :shown="!isOpen && !!slippageError"
  >
    <SharedDropdown
      ref="dropdownRef"
      popper-class="slippage"
      placement="bottom-end"
    >
      <template #default>
        <div>
          <SharedIcon
            name="gear"
            class="h-5 w-5"
            :class="[
              slippageError
                ? 'text-orange-500 hover:opacity-80'
                : {
                    'text-blue-500 hover:opacity-80': isOpen,
                    'text-gray-500 hover:text-blue-500': !isOpen
                  }
            ]"
            :data-cy="dataCyTag(SwapCyTags.SlippageSelectorSetting)"
          />
        </div>
      </template>

      <template #content>
        <div class="p-4 bg-gray-800 text-white">
          <h3 class="text-xs font-bold uppercase tracking-widest">
            {{ $t('trade.swap.advancedSettings') }}
          </h3>
          <div class="my-4 flex items-center gap-2">
            <span class="text-xs">{{ $t('trade.swap.tolerance') }}</span>
            <AppTooltip :content="$t('trade.swap.tooltip')" />
          </div>

          <div class="flex items-center gap-2 max-xs:flex-wrap">
            <div class="flex items-center gap-2 max-xs:w-full">
              <AppButtonSelect
                v-for="slippage in slippageList"
                :key="`slippage-selector-item-${slippage}`"
                v-model="slippageTolerance"
                :value="slippage"
              >
                <template #default>
                  <AppButton size="sm">
                    <div class="mx-auto leading-4">
                      <span class="text-base capitalize">{{ slippage }}</span>
                      <span>%</span>
                    </div>
                  </AppButton>
                </template>
              </AppButtonSelect>
            </div>

            <AppInputNumeric
              v-model="slippageTolerance"
              class="ml-auto"
              input-classes="text-right"
              is-sm
              @blur="checkForInvalidSlippageValue"
            >
              <template v-if="slippageError" #prefix>
                <SharedIcon
                  name="warn"
                  class="min-w-4 text-orange-500 h-4 w-4"
                />
              </template>

              <template #addon>
                <span class="text-gray-500">%</span>
              </template>
            </AppInputNumeric>
          </div>

          <p v-if="slippageError" class="text-orange-500 mt-4 text-sm">
            {{ slippageError }}
          </p>
        </div>
      </template>
    </SharedDropdown>

    <template #content>
      {{ slippageError }}
    </template>
  </AppTooltip>
</template>

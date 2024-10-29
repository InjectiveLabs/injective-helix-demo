<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MAX_SLIPPAGE } from '@/app/utils/constants'
import { SwapFormField, SwapCyTags } from '@/types'

const slippageList = ['0.1', '0.5', '1.0']

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
  <UPopover class="slippage" :popper="{ placement: 'bottom-end' }">
    <template #default="{ open }">
      <div>
        <UIcon
          :name="NuxtUiIcons.Settings"
          class="h-5 w-5 min-w-5"
          :class="{
            'text-blue-500': open,
            'text-coolGray-500': !open
          }"
          :data-cy="dataCyTag(SwapCyTags.SlippageSelectorSetting)"
        />
      </div>
    </template>

    <template #panel>
      <div class="p-4 max-w-sm">
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

          <div class="bg-black rounded-md p-1">
            <AppInputNumeric
              v-model="slippageTolerance"
              @blur="checkForInvalidSlippageValue"
            >
              <template v-if="slippageError" #postfix>
                <div class="flex items-center">
                  <UIcon
                    :name="NuxtUiIcons.WarningOutline"
                    class="w-[18px] h-[18px] min-w-[18px] text-orange-500"
                  />
                </div>
              </template>

              <template #addon>
                <span class="text-coolGray-500">%sdasdasdas</span>
              </template>
            </AppInputNumeric>
          </div>
        </div>

        <p
          v-if="slippageError"
          class="text-orange-500 mt-4 text-sm whitespace-normal"
        >
          {{ slippageError }}
        </p>
      </div>
    </template>
  </UPopover>
</template>

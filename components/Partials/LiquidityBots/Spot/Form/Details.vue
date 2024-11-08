<script setup lang="ts">
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { volatilityStrategyBounds } from '@/app/data/grid-strategy'
import {
  LiquidityBotField,
  LiquidityBotForm,
  LiquidityValues,
  VolatilityStrategyType
} from '@/types'

defineProps<{
  liquidityValues: LiquidityValues
  status: Status
}>()

const formValues = useFormValues<LiquidityBotForm>()

const trailingBounds = computed(() => {
  return new BigNumberInBase(
    volatilityStrategyBounds[
      formValues.value[LiquidityBotField.Volatility] as VolatilityStrategyType
    ].trailingBounds
  )
    .times(100)
    .toFixed()
})
</script>

<template>
  <div>
    <UAccordion
      variant="ghost"
      color="gray"
      default-open
      :items="[
        {
          label: 'Details',
          slot: 'details'
        }
      ]"
    >
      <template #details>
        <div class="text-white space-y-2">
          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('sgt.numberOfGrids') }}
            </p>

            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold">
              {{ liquidityValues.grids }}
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('sgt.lowerPrice') }}
            </p>
            <div class="font-semibold">
              <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

              <SharedAmountCollapsed
                v-else
                should-truncate
                :amount="liquidityValues.lowerBound.toFixed()"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('sgt.upperPrice') }}
            </p>
            <div class="font-semibold">
              <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

              <SharedAmountCollapsed
                v-else
                should-truncate
                :amount="liquidityValues.upperBound.toFixed()"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.trailingBoundaries') }}
            </p>
            <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

            <div v-else class="font-semibold flex items-center gap-1">
              ±
              {{ trailingBounds }}% /
              <SharedAmountCollapsed
                should-truncate
                :amount="liquidityValues.trailingUpperBound.toFixed()"
              />
              -
              <SharedAmountCollapsed
                should-truncate
                :amount="liquidityValues.trailingLowerBound.toFixed()"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.currentPrice') }}
            </p>
            <div class="font-semibold">
              <USkeleton v-if="status.isLoading()" class="w-16 h-5" />

              <SharedAmountCollapsed
                v-else
                should-truncate
                :amount="liquidityValues.trailingLowerBound.toFixed()"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.stopLoss') }}
            </p>
            <p class="font-semibold">ToDo</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-xs text-coolGray-500">
              {{ $t('liquidityBots.takeProfit') }}
            </p>
            <p class="font-semibold">ToDo</p>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

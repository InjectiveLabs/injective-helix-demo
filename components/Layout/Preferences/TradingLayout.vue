<script lang="ts" setup>
import { TradingLayout } from '@/types'

const appStore = useAppStore()

function onChangeTradingLayout(tradingLayout: TradingLayout) {
  appStore.setUserState({
    ...appStore.userState,
    preferences: {
      ...appStore.userState.preferences,
      tradingLayout
    }
  })
}
</script>

<template>
  <div
    class="flex-col p-4 gap-3 pointer-events-none hidden lg:flex lg:pointer-events-auto text-gray-100 text-xs"
  >
    <span class="font-semibold">
      {{ $t('trade.tradingLayout') }}
    </span>

    <AppRadioGroup
      class="flex gap-8 items-start"
      :value="appStore.userState.preferences.tradingLayout"
      @change="onChangeTradingLayout"
    >
      <template #options="{ value, setValue }">
        <AppRadioButton
          :is-active="value === TradingLayout.Left"
          @click="setValue(TradingLayout.Left)"
        >
          <template #label>
            <span>
              {{ $t('trade.tradingLayoutOptions.left') }}
            </span>
          </template>

          <template #addon>
            <div
              class="border rounded-sm"
              :class="{
                'border-white': value === TradingLayout.Left,
                'border-transparent': value !== TradingLayout.Left
              }"
            >
              <img src="/images/layout-left.svg" class="pointer-events-none" />
            </div>
          </template>
        </AppRadioButton>

        <AppRadioButton
          :is-active="value === TradingLayout.Right"
          @click="setValue(TradingLayout.Right)"
        >
          <template #label>
            <span>
              {{ $t('trade.tradingLayoutOptions.right') }}
            </span>
          </template>

          <template #addon>
            <div
              class="border rounded-sm"
              :class="{
                'border-white': value === TradingLayout.Right,
                'border-transparent': value !== TradingLayout.Right
              }"
            >
              <img src="/images/layout-right.svg" class="pointer-events-none" />
            </div>
          </template>
        </AppRadioButton>
      </template>
    </AppRadioGroup>
  </div>
</template>

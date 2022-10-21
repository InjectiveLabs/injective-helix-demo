<template>
  <div class="flex flex-col p-4 gap-3">
    <span class="font-semibold">
      {{ $t('trade.tradingLayout') }}
    </span>

    <RadioGroup
      class="flex gap-8 items-start"
      :value="tradingLayout"
      @change="handleChangeTradingLayout"
    >
      <template #options="{ value, setValue }">
        <RadioButton
          :active="value === TradingLayout.Left"
          @click="() => setValue(TradingLayout.Left)"
        >
          <template #label>
            <span class="text-white">
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
        </RadioButton>

        <RadioButton
          :active="value === TradingLayout.Right"
          @click="() => setValue(TradingLayout.Right)"
        >
          <template #label>
            <span class="text-white">
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
        </RadioButton>
      </template>
    </RadioGroup>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import RadioGroup from '~/components/elements/radio-group.vue'
import RadioButton from '~/components/elements/radio-button.vue'
import { TradingLayout } from '~/types'
import { UserBasedState } from '~/store/app'

export default Vue.extend({
  components: {
    RadioGroup,
    RadioButton
  },

  data() {
    return {
      TradingLayout
    }
  },

  computed: {
    userState(): UserBasedState {
      return this.$accessor.app.userState
    },

    tradingLayout(): TradingLayout {
      return this.$accessor.app.userState.tradingLayout
    }
  },

  methods: {
    handleChangeTradingLayout(tradingLayout: TradingLayout) {
      const { userState } = this

      this.$accessor.app.setUserState({
        ...userState,
        tradingLayout
      })
    }
  }
})
</script>

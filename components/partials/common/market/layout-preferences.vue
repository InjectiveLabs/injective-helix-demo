<template>
  <div class="flex flex-col p-4 gap-3">
    <span class="font-semibold">
      {{ $t('trade.tradingLayout') }}
    </span>

    <RadioGroup
      class="flex gap-8 items-start"
      :value="tradingLayoutAlignment"
      @change="handleSetTradingLayoutAlignment"
    >
      <template #options="{ value, setValue }">
        <RadioButton
          :active="value === TradingLayoutAlignment.Left"
          @click="() => setValue(TradingLayoutAlignment.Left)"
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
                'border-white': value === TradingLayoutAlignment.Left,
                'border-transparent': value !== TradingLayoutAlignment.Left
              }"
            >
              <img src="/images/layout-left.svg" class="pointer-events-none" />
            </div>
          </template>
        </RadioButton>

        <RadioButton
          :active="value === TradingLayoutAlignment.Right"
          @click="() => setValue(TradingLayoutAlignment.Right)"
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
                'border-white': value === TradingLayoutAlignment.Right,
                'border-transparent': value !== TradingLayoutAlignment.Right
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
import { TradingLayoutAlignment } from '~/types'
import { UserBasedState } from '~/store/app'

export default Vue.extend({
  components: {
    RadioGroup,
    RadioButton
  },

  data() {
    return {
      TradingLayoutAlignment
    }
  },

  computed: {
    userState(): UserBasedState {
      return this.$accessor.app.userState
    },

    tradingLayoutAlignment(): TradingLayoutAlignment {
      return this.$accessor.app.userState.tradingLayoutAlignment
    }
  },

  methods: {
    handleSetTradingLayoutAlignment(alignment: TradingLayoutAlignment) {
      const { userState } = this

      this.$accessor.app.setUserState({
        ...userState,
        tradingLayoutAlignment: alignment
      })
    }
  }
})
</script>

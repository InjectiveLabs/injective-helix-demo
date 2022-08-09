<template>
  <div class="flex items-center justify-start gap-4">
    <span
      class="text-sm font-semibold cursor-pointer"
      :class="{
        'text-gray-500':
          tradingTypeMarket | tradingTypeStopLimit | tradingTypeStopMarket,
        'text-primary-500': tradingTypeLimit
      }"
      data-cy="trading-page-switch-to-limit-button"
      @click.stop="onTradingTypeToggle(TradeExecutionType.LimitFill)"
    >
      {{ $t('trade.limit') }}
    </span>

    <span
      class="text-sm font-semibold cursor-pointer"
      :class="{
        'text-gray-500':
          tradingTypeLimit | tradingTypeStopLimit | tradingTypeStopMarket,
        'text-primary-500': tradingTypeMarket
      }"
      data-cy="trading-page-switch-to-market-button"
      @click.stop="onTradingTypeToggle(TradeExecutionType.Market)"
    >
      {{ $t('trade.market') }}
    </span>

    <div class="flex items-center justify-start">
      <span
        class="text-sm font-semibold cursor-pointer"
        :class="{
          'text-gray-500': !tradingTypeStopMarket && !tradingTypeStopLimit,
          'text-primary-500': tradingTypeStopMarket || tradingTypeStopLimit
        }"
        data-cy="trading-page-switch-to-stop-button"
        @click.stop="
          onTradingTypeToggle(
            tradingTypeStopMarket ? 'stopMarket' : 'stopLimit'
          )
        "
      >
        {{ selectLabel }}
      </span>

      <Select
        :options="selectOptions"
        :value="tradingType"
        hide-current-value
        @change="({ value }) => onTradingTypeToggle(value)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import Select from '@/components/elements/select.vue'

export default Vue.extend({
  components: {
    Select
  },

  props: {
    tradingType: {
      type: String,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeLimit: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeStopMarket: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeStopLimit: {
      type: Boolean as PropType<boolean>,
      required: true
    }
  },

  data() {
    return {
      TradeExecutionType,
      selectOptions: [
        {
          label: this.$t('trade.stopLimit'),
          value: 'stopLimit'
        },
        {
          label: this.$t('trade.stopMarket'),
          value: 'stopMarket'
        }
      ]
    }
  },

  computed: {
    selectLabel(): string | undefined {
      const { tradingTypeStopMarket } = this

      if (tradingTypeStopMarket) {
        return this.$t('trade.stopMarket')
      }

      return this.$t('trade.stopLimit')
    }
  },

  methods: {
    onTradingTypeToggle(tradingType: TradeExecutionType) {
      this.$emit('update:trading-type', tradingType)
    }
  }
})
</script>

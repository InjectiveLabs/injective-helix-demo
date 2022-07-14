<template>
  <VDropdown round hide-bottom-border>
    <template slot="title">
      <div class="flex items-center justify-between bg-gray-900 flex-grow">
        <slot name="label" />
        <span
          class="text-xs ml-2"
          :class="{ 'text-gray-200': value !== undefined }"
          data-cy="reusable-selected-value-text-content"
        >
          {{ selectedValue }}
        </span>
      </div>
    </template>

    <div class="text-center cursor-pointer">
      <SelectorItem
        v-for="(item, index) in list"
        :key="`type-selector-${index}`"
        :item="item"
        :data-cy="'reusable-selector-item-' + item.text + '-text-content'"
        @click="handleClick"
      >
        {{ item.text }}
      </SelectorItem>
    </div>
  </VDropdown>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TradeDirection } from '@injectivelabs/ts-types'
import { TransferType } from '@injectivelabs/sdk-ts'
import VDropdown from '~/components/elements/dropdown.vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import { TradeSelectorType, TradeTypes } from '~/types/enums'

export default Vue.extend({
  components: {
    VDropdown,
    SelectorItem
  },

  props: {
    type: {
      type: String as PropType<TradeSelectorType>,
      required: true
    },

    value: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      placeholder: '',
      list: [] as { text: string; value: string | undefined }[]
    }
  },

  computed: {
    selectedValue(): string {
      const { list, value: selected, placeholder } = this

      if (!selected) {
        return placeholder
      }

      return (
        list.find(({ value }) => value === selected)?.text ||
        this.$t('trade.all')
      )
    }
  },

  mounted() {
    if (this.type === TradeSelectorType.Type) {
      this.list = [
        {
          text: this.$t('trade.all'),
          value: undefined
        },
        {
          text: this.$t('trade.market'),
          value: TradeTypes.Market
        },
        {
          text: this.$t('trade.limit'),
          value: TradeTypes.Limit
        }
      ]
      this.placeholder = this.$t('trade.type')
    }

    if (this.type === TradeSelectorType.TransferType) {
      this.list = [
        {
          text: this.$t('trade.all'),
          value: undefined
        },
        {
          text: this.$t('walletHistory.transfers.deposit'),
          value: TransferType.Deposit
        },
        {
          text: this.$t('walletHistory.transfers.deposit'),
          value: TransferType.Withdraw
        }
      ]
      this.placeholder = this.$t('trade.type')
    }

    if (this.type === TradeSelectorType.Side) {
      this.list = [
        {
          text: this.$t('trade.all'),
          value: undefined
        },
        {
          text: this.$t('trade.buy'),
          value: TradeDirection.Buy
        },
        {
          text: this.$t('trade.sell'),
          value: TradeDirection.Sell
        }
      ]
      this.placeholder = this.$t('trade.side')
    }

    if (this.type === TradeSelectorType.PositionSide) {
      this.list = [
        {
          text: this.$t('trade.all'),
          value: undefined
        },
        {
          text: this.$t('trade.long'),
          value: TradeDirection.Long
        },
        {
          text: this.$t('trade.short'),
          value: TradeDirection.Short
        }
      ]
      this.placeholder = this.$t('trade.side')
    }
  },

  methods: {
    handleClick({ value }: { value: string }) {
      this.$emit('click', value)
    }
  }
})
</script>

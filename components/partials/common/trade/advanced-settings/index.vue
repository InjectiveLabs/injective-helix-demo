<template>
  <div class="border-t mt-6">
    <div
      class="group flex align-center my-2 cursor-pointer"
      @click="toggleDrawer"
    >
      <span
        class="block font-semibold text-sm text-gray-200 flex-1"
        data-cy="trading-page-advanced-settings-span"
      >
        {{ $t('trade.advanced_settings') }}
      </span>
      <div class="flex items-stretch">
        <IconCaretDown
          class="text-gray-500 group-hover:text-gray-200 transform rotate-180 self-center w-4 h-4"
          :class="{ 'rotate-0': !drawerIsOpen }"
        />
      </div>
    </div>
    <div v-show="drawerIsOpen" class="flex gap-1 my-auto">
      <span class="flex flex-col flex-1 my-auto gap-1">
        <VCheckbox
          :value="reduceOnly"
          :disabled="reduceOnlyDisabled"
          :tooltip="reduceOnlyTooltip"
          data-cy="trading-page-reduce-only-checkbox"
          @input="handleReduceOnlyCheckboxToggle"
        >
          <slot>
            <span class="text-sm">
              {{ $t('trade.reduce_only') }}
            </span>
          </slot>
        </VCheckbox>
        <div class="flex justify-between">
          <VCheckbox
            v-if="tradingTypeMarket || tradingTypeStopMarket"
            v-model="slippageIsToggleable"
            data-cy="trading-page-slippage-checkbox"
            @input="handleSlippageCheckboxToggle"
          >
            <slot>
              <span class="text-sm">
                {{ `${$t('trade.slippage_tolerance')} :` }}
              </span>
            </slot>
          </VCheckbox>
          <div
            v-show="showSlippageAsSelectableOrDefaultForMarket"
            class="group flex items-center cursor-pointer gap-2"
            @click="toggleToSlippageInput()"
          >
            <div class="text-sm">{{ slippageTolerance }}%</div>
            <IconCaretDown
              class="text-gray-500 group-hover:text-gray-200 w-4 h-4"
              data-cy="trading-page-slippage-toggle-icon"
              :class="{
                invisible: !slippageIsToggleable
              }"
            />
          </div>
          <div v-show="showSlippageInputFieldForMarket">
            <v-input
              id="focusOnInput"
              :value="slippageTolerance"
              :wrapper-classes="wrapperClasses"
              :input-classes="inputClasses"
              :disabled="!slippageIsToggleable"
              type="number"
              :step="0.01"
              :max-decimals="2"
              :min="0"
              :max="50"
              dense
              small
              :show-prefix="hasWarning || hasError"
              show-addon
              data-cy="trading-page-slippage-input"
              @input="handleInput"
              @blur="handleBlur"
            >
              <span slot="addon" class="lg:hidden"> % </span>
            </v-input>
          </div>
        </div>
        <VCheckbox
          v-if="tradingTypeLimit"
          :value="postOnly"
          data-cy="trading-page-post-only-checkbox"
          @input="handlePostOnlyCheckboxToggle"
        >
          <slot>
            <span class="text-sm">
              {{ $t('trade.post_only') }}
            </span>
          </slot>
        </VCheckbox>
      </span>
    </div>
    <Error
      :has-error.sync="hasError"
      :has-warning.sync="hasWarning"
      v-bind="{ slippageTolerance, tradingTypeMarket }"
      @update:has-error="handleHasErrorUpdateEvent"
    />
  </div>
</template>

<script lang="ts">
import { TradeExecutionType } from '@injectivelabs/ts-types'
import Vue, { PropType } from 'vue'
import { DEFAULT_MAX_SLIPPAGE } from '~/app/utils/constants'
import Error from '~/components/partials/common/trade/advanced-settings/error.vue'

enum SlippageDisplayOptions {
  NonSelectableDefault = 'Zero',
  SlippageInput = 'Selected',
  Selectable = 'Selectable'
}
export default Vue.extend({
  components: {
    Error
  },

  props: {
    slippageTolerance: {
      type: String,
      required: true
    },

    tradingType: {
      type: String as PropType<TradeExecutionType>,
      required: true
    },

    showReduceOnly: {
      type: Boolean,
      required: false,
      default: false
    },

    reduceOnly: {
      type: Boolean,
      required: false,
      default: false
    },

    reduceOnlyDisabled: {
      type: Boolean,
      required: false,
      default: false
    },

    postOnly: {
      type: Boolean,
      required: true
    },

    isConditionalOrder: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      drawerIsOpen: true,
      SlippageDisplayOptions,
      slippageSelection: SlippageDisplayOptions.Selectable,
      slippageIsToggleable: true,
      hasWarning: false,
      hasError: false
    }
  },

  computed: {
    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    tradingTypeLimit(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.LimitFill
    },

    tradingTypeStopLimit(): boolean {
      const { tradingType } = this

      // TODO: Replace with enum from BE once available.
      return tradingType.toString() === 'stopLimit'
    },

    tradingTypeStopMarket(): boolean {
      const { tradingType } = this

      // TODO: Replace with enum from BE once available.
      return tradingType.toString() === 'stopMarket'
    },

    wrapperClasses(): string {
      const { hasWarning, hasError } = this

      if (hasWarning) {
        return 'border-warning bg-warning bg-opacity-10 border shadow-none'
      }

      if (hasError) {
        return 'border-error bg-error bg-opacity-10 border shadow-none'
      }

      return 'border-transparent border shadow-none'
    },

    inputClasses(): string {
      const { hasWarning, hasError } = this

      if (hasWarning || hasError) {
        return 'bg-transparent text-right text-sm px-1'
      }

      return 'text-right text-sm px-1'
    },

    showSlippageAsSelectableOrDefaultForMarket(): boolean {
      const { slippageSelection, tradingTypeMarket, tradingTypeStopMarket } =
        this

      return (
        (slippageSelection === SlippageDisplayOptions.Selectable ||
          slippageSelection === SlippageDisplayOptions.NonSelectableDefault) &&
        (tradingTypeMarket || tradingTypeStopMarket)
      )
    },

    showSlippageInputFieldForMarket(): boolean {
      const { slippageSelection, tradingTypeMarket, tradingTypeStopMarket } =
        this

      return (
        slippageSelection === SlippageDisplayOptions.SlippageInput &&
        (tradingTypeMarket || tradingTypeStopMarket)
      )
    },

    reduceOnlyTooltip(): string | undefined {
      const { isConditionalOrder, reduceOnlyDisabled } = this

      if (!reduceOnlyDisabled) {
        return
      }

      return isConditionalOrder
        ? this.$t('trade.reduceOnlyTooltipConditional')
        : this.$t('trade.reduceOnlyTooltip')
    }
  },

  methods: {
    handleBlur(value: string): void {
      if (value === '') {
        value = DEFAULT_MAX_SLIPPAGE.toFormat(1)
      }

      if (Number(value) > 50) {
        this.$emit('set:slippageTolerance', value)
      }

      this.$emit('set:slippageTolerance', value)

      this.toggleSlippageToSelectable()
    },

    handleSlippageCheckboxToggle(checked: boolean) {
      if (!checked) {
        this.setToZeroSlippage()
      } else {
        this.setToDefaultSlippage()
        this.toggleSlippageToSelectable()
      }
    },

    handleHasErrorUpdateEvent(hasError: boolean): void {
      this.$emit('update:hasAdvancedSettingsErrors', hasError)
    },

    handleReduceOnlyCheckboxToggle(checked: boolean) {
      this.$emit('set:reduceOnly', checked)
    },

    handlePostOnlyCheckboxToggle(checked: boolean) {
      this.$emit('set:postOnly', checked)
    },

    setToZeroSlippage() {
      this.slippageSelection = SlippageDisplayOptions.NonSelectableDefault

      this.$emit('set:slippageTolerance', '0')
    },

    setToDefaultSlippage() {
      this.slippageSelection = SlippageDisplayOptions.NonSelectableDefault

      this.$emit('set:slippageTolerance', DEFAULT_MAX_SLIPPAGE.toFormat(1))
    },

    toggleSlippageToSelectable() {
      this.slippageSelection = SlippageDisplayOptions.Selectable
    },

    toggleToSlippageInput() {
      this.slippageSelection = SlippageDisplayOptions.SlippageInput

      window.requestAnimationFrame(this.focusOnSlippageInput)
    },

    focusOnSlippageInput() {
      const slippageInput = document.getElementById(
        'focusOnInput'
      ) as HTMLInputElement

      if (slippageInput) {
        slippageInput.focus()
      }
    },

    toggleDrawer() {
      this.drawerIsOpen = !this.drawerIsOpen
    },

    handleInput(value: string) {
      this.setSlippageTolerance(value)
    },

    setSlippageTolerance(value: string): void {
      this.$emit('set:slippageTolerance', value)
    }
  }
})
</script>

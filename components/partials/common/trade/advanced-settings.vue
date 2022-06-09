<template>
  <div class="border-t mt-6">
    <div
      class="group flex align-center my-2 cursor-pointer"
      @click="toggleDrawer"
    >
      <span class="block font-semibold text-sm text-gray-200 flex-1">
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
          v-if="showReduceOnly"
          :value="reduceOnly"
          class="mt-2"
          @input="handleReduceOnlyCheckboxToggle"
        >
          <slot class="text-xs"> {{ $t('trade.reduce_only') }}</slot>
        </VCheckbox>
        <div class="flex">
          <VCheckbox
            v-if="tradingTypeMarket"
            v-model="slippageIsToggleable"
            class="flex items-center flex-1"
            @input="handleSlippageCheckboxToggle"
          >
            <slot class="text-xs">
              {{ `${$t('trade.slippage_tolerance')} :` }}
            </slot>
          </VCheckbox>
          <div
            v-show="showSlippageAsSelectableOrDefaultForMarket"
            class="group flex items-center cursor-pointer gap-2"
            @click="toggleToSlippageInput()"
          >
            <div>{{ slippageTolerance }}%</div>
            <IconCaretDown
              class="text-gray-500 group-hover:text-gray-200 w-4 h-4"
              :class="{
                visibility:
                  slippageSelection === SlippageDisplayOptions.Selectable
              }"
            />
          </div>
          <div v-show="showSlippageInputFieldForMarket">
            <v-input
              id="focusOnInput"
              :value="slippageTolerance"
              :wrapper-classes="wrapperClasses"
              :input-classes="inputClasses"
              :disabled="false"
              type="number"
              :step="0.01"
              :max-decimals="2"
              :min="0"
              :max="50"
              dense
              small
              :show-prefix="hasWarning || hasError"
              show-addon
              @input="handleInput"
              @blur="handleBlur"
            >
              <span slot="addon" class="lg:hidden"> % </span>
            </v-input>
          </div>
        </div>
        <VCheckbox
          v-if="!tradingTypeMarket"
          :value="postOnly"
          class="flex items-center"
          @input="handlePostOnlyCheckboxToggle"
        >
          <slot class="text-xs">
            {{ $t('trade.post_only') }}
          </slot>
        </VCheckbox>
      </span>
    </div>
    <div
      v-if="hasWarning || hasError"
      class="flex mt-4 gap-2 text-xs font-semibold"
      :class="hasWarning ? 'text-warning' : 'text-error'"
      font-semibold
      text-2xs
    >
      <IconExclamationCircleFill />
      <span v-if="hasWarning">
        {{ slippageWarning }}
      </span>
      <span v-if="hasError">
        {{ slippageError }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { DEFAULT_MAX_SLIPPAGE } from '~/app/utils/constants'

enum SlippageDisplayOptions {
  NonSelectableDefault = 'Zero',
  SlippageInput = 'Selected',
  Selectable = 'Selectable'
}
export default Vue.extend({
  props: {
    slippageWarning: {
      type: String,
      default: ''
    },

    slippageError: {
      type: String,
      default: ''
    },

    slippageTolerance: {
      type: String,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    showReduceOnly: {
      type: Boolean,
      required: true
    },

    reduceOnly: {
      type: Boolean,
      required: true
    },

    postOnly: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      drawerIsOpen: true,
      SlippageDisplayOptions,
      slippageSelection: SlippageDisplayOptions.Selectable,
      slippageIsToggleable: true
    }
  },

  computed: {
    hasWarning(): boolean {
      const { slippageWarning } = this
      if (slippageWarning) {
        return true
      }

      return false
    },

    hasError(): boolean {
      const { slippageError } = this
      if (slippageError) {
        return true
      }

      return false
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
        return 'bg-transparent text-right px-1'
      }

      return 'text-right px-1'
    },

    showSlippageAsSelectableOrDefaultForMarket(): boolean {
      const { slippageSelection, tradingTypeMarket } = this

      return (
        (slippageSelection === SlippageDisplayOptions.Selectable ||
          slippageSelection === SlippageDisplayOptions.NonSelectableDefault) &&
        tradingTypeMarket
      )
    },

    showSlippageInputFieldForMarket(): boolean {
      const { slippageSelection, tradingTypeMarket } = this

      return (
        slippageSelection === SlippageDisplayOptions.SlippageInput &&
        tradingTypeMarket
      )
    }
  },

  methods: {
    handleBlur(value: string): void {
      if (value === '') {
        value = DEFAULT_MAX_SLIPPAGE.toFormat(1)
      }

      this.$emit('set-slippage-tolerance', value)

      this.toggleSlippageToSelectable()
    },

    handleSlippageCheckboxToggle(checked: boolean) {
      if (!checked) {
        this.defaultToZeroSlippage()
      } else {
        this.toggleSlippageToSelectable()
      }
    },

    handleReduceOnlyCheckboxToggle(checked: boolean) {
      this.$emit('set-reduce-only', checked)
    },

    handlePostOnlyCheckboxToggle(checked: boolean) {
      this.$emit('set-post-only', checked)
    },

    defaultToZeroSlippage() {
      this.slippageSelection = SlippageDisplayOptions.NonSelectableDefault

      this.$emit('set-slippage-tolerance', '0')
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
      this.$emit('set-slippage-tolerance', value)
    }
  }
})
</script>

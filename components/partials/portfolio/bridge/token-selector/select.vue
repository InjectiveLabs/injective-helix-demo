<template>
  <div>
    <ValidationObserver
      v-slot="{ errors: { amount: inputErrors } }"
      ref="bridge-token-input"
    >
      <VSelect
        id="bridge-input-select"
        v-bind="$attrs"
        ref="tokenSelector"
        class="input-select input-token flex"
        data-cy="token-selector-drop-down"
        :class="{
          'input-error': inputErrors && inputErrors.length > 0,
          'rounded-full': rounded
        }"
        label="denom"
        :auto-scroll="false"
        :clearable="false"
        :searchable="false"
        :disabled="disabled"
        :dropdown-should-open="dropdownShouldOpen"
        :options="filteredOptions"
        :value="value"
        @input="handleChange"
        @close="setForceClose"
        @click.native="handleDropdownToggle"
      >
        <template #open-indicator="{ attributes }">
          <div
            v-bind="attributes"
            class="cursor-pointer"
            :class="{ 'mr-4': showDefaultIndicator }"
          >
            <IconCaretDownSlim v-if="showDefaultIndicator" />
          </div>
        </template>

        <template #selected-option="{ symbol, logo, name }">
          <ValidationProvider
            v-slot="{ errors, valid }"
            ref="validationProvider"
            name="amount"
            class="w-full"
            :rules="
              validationRules ||
              `required|positiveNumber|enoughBalance:0.0001,${balanceToFixed}`
            "
          >
            <div
              :class="{ 'flex justify-between items-center gap-4': showInput }"
            >
              <div v-if="showInput" class="flex flex-col w-full justify-center">
                <VInput
                  id="bridge-input"
                  dense
                  :small="small"
                  :lg="lg"
                  transparent-bg
                  type="number"
                  :step="step"
                  min="0"
                  :placeholder="step"
                  :errors="errors"
                  hide-errors
                  :valid="valid"
                  :max="balanceToFixed"
                  :max-decimals="maxDecimals"
                  :max-classes="'input-max-button'"
                  :value="amount"
                  :prefix="prefix"
                  :input-classes="inputClass"
                  data-cy="token-selector-amount-input"
                  :disabled="disabled"
                  disable-addon-padding
                  @input="handleAmountChange"
                  @input:max="handleEmitMax"
                  @blur="resetIsSearching"
                  @mousedown.native.stop="focusInput"
                />
                <div class="pl-4">
                  <span
                    v-if="!showErrorsBelow && errors.length > 0"
                    class="text-red-400 text-[12px]"
                  >
                    {{ errors[0] }}
                  </span>
                  <span
                    v-else-if="usdPrice !== -1"
                    class="text-gray-500 text-[12px]"
                  >
                    {{ usdPrice }} USD
                  </span>
                </div>
              </div>
              <div class="flex flex-col">
                <div
                  class="flex items-center h-[32px] ml-4"
                  data-cy="token-selector-drop-down"
                  :class="{
                    'justify-end': showInput,
                    'justify-start': !showInput
                  }"
                >
                  <img
                    v-if="logo"
                    :src="getTokenLogoWithVendorPathPrefix(logo)"
                    :alt="name"
                    class="rounded-full w-6 h-6 vs__selected-icon"
                  />
                  <IconCategoryAlt v-else class="rounded-full w-6 h-6" />
                  <span
                    class="font-semibold text-lg px-2 text-gray-200 tracking-wide break-normal vs__selected-text-content"
                    data-cy="token-selector-selected-text-content"
                  >
                    {{ symbol }}
                  </span>
                  <div
                    v-if="showCustomIndicator"
                    class="block pr-4 text-white"
                    :class="{ 'ml-auto': !showInput }"
                  >
                    <IconCaretDownSlim />
                  </div>
                </div>
                <div
                  v-if="showBalance || showMaxSelector"
                  class="h-5 flex items-center justify-end gap-2 pr-4"
                >
                  <span
                    v-if="showBalance"
                    data-cy="token-selector-selected-balance-span"
                    class="text-xs whitespace-nowrap"
                    :class="{
                      'text-red-400': errors.length > 0,
                      'text-primary-500': errors.length === 0
                    }"
                  >
                    {{ $t('bridge.balance') }}: {{ balanceToFixed }}
                  </span>
                  <button
                    v-if="showMaxSelector"
                    class="bg-primary-500 bg-opacity-20 rounded px-1 h-4 cursor-pointer flex items-center justify-center hover:bg-opacity-40 group"
                    @click.stop="handleMax"
                  >
                    <span
                      class="text-3xs text-primary-500 text-xs whitespace-nowrap uppercase group-hover:text-white"
                    >
                      Max
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <template v-if="showErrorsBelow && errors.length > 0">
              <portal to="token-selector-errors">
                <span
                  data-cy="token-selector-errors"
                  class="text-red-400 text-xs block mt-2"
                >
                  {{ errors[0] }}
                </span>
              </portal>
            </template>
          </ValidationProvider>
        </template>

        <template #list-header>
          <li class="mb-4">
            <VInput
              id="bridge-input-search"
              v-model="search"
              dense
              round
              :placeholder="$t('common.search')"
              data-cy="token-selector-search"
              :input-classes="'bg-gray-900 rounded'"
              @blur="resetIsSearching"
              @click.native.stop="focusSearchInput"
            >
              <IconSearch slot="addon" class="w-6 h-6" />
            </VInput>
          </li>
        </template>

        <template #option="item">
          <TokenSelectorItem :item="item" :dense="dense" />
        </template>
      </VSelect>
    </ValidationObserver>
    <portal-target
      name="token-selector-errors"
      data-cy="token-selector-errors"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import VSelect from 'vue-select'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  BankBalanceWithTokenAndBalanceInBase,
  BIG_NUMBER_ROUND_DOWN_MODE,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import TokenSelectorItem from './item.vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VSelect,
    TokenSelectorItem,
    ValidationObserver,
    ValidationProvider
  },

  inheritAttrs: false,

  props: {
    options: {
      type: Array as PropType<BankBalanceWithTokenAndBalanceInBase[]>,
      required: true
    },

    amount: {
      type: [Object, String, Number],
      default: ''
    },

    prefix: {
      type: [Object, String, Number],
      default: null
    },

    disabled: {
      type: Boolean,
      required: false,
      default: false
    },

    balance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    balanceDecimalPlaces: {
      type: Number,
      default: UI_DEFAULT_DISPLAY_DECIMALS
    },

    showBalance: {
      type: Boolean,
      default: false
    },

    usdPrice: {
      type: Number,
      default: -1
    },

    value: {
      type: [Object, String, Number],
      default: ''
    },

    disableMaxSelector: {
      type: Boolean,
      default: false
    },

    dense: {
      type: Boolean,
      default: false
    },

    validationRules: {
      type: String,
      default: ''
    },

    small: {
      type: Boolean,
      default: false
    },

    lg: {
      type: Boolean,
      default: false
    },

    showErrorsBelow: {
      type: Boolean,
      default: false
    },

    step: {
      type: String,
      default: '0.01'
    },

    maxDecimals: {
      type: Number,
      default: UI_DEFAULT_DISPLAY_DECIMALS
    },

    showInput: {
      type: Boolean,
      default: false
    },

    showDefaultIndicator: {
      type: Boolean,
      default: false
    },

    showCustomIndicator: {
      type: Boolean,
      default: false
    },

    rounded: {
      type: Boolean,
      default: false
    },

    formId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      search: '',
      forceClose: true,
      isSearching: false,
      isDropdownOpen: false,
      getTokenLogoWithVendorPathPrefix
    }
  },

  computed: {
    inputClass(): string {
      const { prefix } = this
      const classes = ['text-lg font-bold']

      if (prefix) {
        classes.push('pl-0')
      }

      return classes.join(' ')
    },

    balanceToFixed(): string {
      const { balance, balanceDecimalPlaces } = this

      return balance.toFixed(balanceDecimalPlaces, BIG_NUMBER_ROUND_DOWN_MODE)
    },

    filteredOptions(): BankBalanceWithTokenAndBalanceInBase[] {
      const { options, search } = this

      return options.filter((option) => {
        if (option.token && option.token.symbol) {
          return (option.token.symbol || '')
            .toLowerCase()
            .includes(search.toLowerCase())
        }

        return false
      })
    },

    $inputForm(): InstanceType<typeof ValidationObserver> {
      return this.$refs['bridge-token-input'] as InstanceType<
        typeof ValidationObserver
      >
    },

    showMaxSelector(): boolean {
      const { disableMaxSelector, balance } = this

      return !disableMaxSelector && balance.gt(0.0001)
    }
  },

  watch: {
    formId: {
      handler() {
        this.resetValidation()
      },
      immediate: true
    }
  },

  mounted() {
    this.$root.$on('bridge:reset', this.resetInputFields)
  },

  beforeDestroy() {
    this.$root.$off('bridge:reset', this.resetInputFields)
  },

  methods: {
    resetInputFields() {
      if (this.$inputForm) {
        this.$inputForm.reset()
      }
    },

    resetValidation() {
      if (this.$refs.validationProvider) {
        const validationProvider = this.$refs.validationProvider as InstanceType<typeof ValidationProvider>

        validationProvider.reset()
      }
    },

    resetIsSearching() {
      this.isSearching = false
    },

    handleDropdownToggle() {
      const { $refs }: { $refs: Record<string, any> } = this
      const isOpen = $refs.tokenSelector.open || false

      if (isOpen) {
        this.forceClose = false
      }
    },

    setForceClose() {
      const { isSearching } = this

      if (!isSearching) {
        this.forceClose = true
      }
    },

    dropdownShouldOpen({ open }: { open: boolean }) {
      const { isSearching, forceClose } = this

      if (forceClose) {
        return false
      }

      return open || isSearching
    },

    focusInput() {
      const element = document.getElementById('bridge-input')

      if (element) {
        this.isSearching = false
        element.focus()
      }
    },

    focusSearchInput() {
      const element = document.getElementById('bridge-input-search')

      if (element) {
        this.isSearching = true
        element.focus()
      }
    },

    handleAmountChange(value: string) {
      this.$emit('input:amount', value)
    },

    handleChange(value: BankBalanceWithTokenAndBalanceInBase) {
      this.forceClose = true

      this.$emit('input', value.token)
      this.$emit('input:token', value.token)
    },

    handleEmitMax(value: string) {
      this.$emit('input:max', value)
    },

    handleMax() {
      const { balanceToFixed, maxDecimals } = this

      const value = new BigNumberInBase(balanceToFixed).toFixed(
        maxDecimals,
        BigNumber.ROUND_DOWN
      )

      this.$emit('input:max', value)
    }
  }
})
</script>

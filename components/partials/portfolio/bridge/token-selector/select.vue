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
        :class="{ 'input-error': inputErrors && inputErrors.length > 0 }"
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
          <span v-bind="attributes" class="cursor-pointer"> </span>
        </template>

        <template #selected-option="{ symbol, logo, name }">
          <ValidationProvider
            v-slot="{ errors, valid }"
            name="amount"
            class="w-full"
            :rules="
              validationRules ||
              `required|positiveNumber|enoughBalance:0.0001,${balanceToFixed}`
            "
          >
            <div class="flex justify-between gap-4 items-center">
              <div class="flex flex-col w-full justify-center">
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
                  :max-selector="!disableMaxSelector && balance.gt(0.0001)"
                  :max-classes="'input-max-button'"
                  :value="amount"
                  :prefix="prefix"
                  :input-classes="inputClass"
                  data-cy="token-selector-amount-input"
                  :disabled="disabled"
                  disable-addon-padding
                  @input="handleAmountChange"
                  @input-max="handleMax"
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
                    v-else-if="usdPrice !== ''"
                    class="text-gray-500 text-[12px]"
                  >
                    {{ usdPrice }} USD
                  </span>
                </div>
              </div>
              <div class="flex flex-col">
                <div class="flex justify-end items-center h-[32px] ml-4">
                  <img
                    v-if="logo"
                    :src="logo"
                    :alt="name"
                    class="rounded-full w-4 h-4"
                  />
                  <IconCategoryAlt v-else class="rounded-full w-4 h-4" />
                  <span
                    class="font-bold text-lg px-3 text-gray-200 tracking-wide break-normal"
                    data-cy="token-selector-selected-text-content"
                  >
                    {{ symbol }}
                  </span>
                  <div class="block pr-4 text-white">
                    <IconCaretDownSlim />
                  </div>
                </div>
                <div v-if="showBalance" class="pr-4 h-5 relative">
                  <span
                    class="text-[12px] whitespace-nowrap absolute right-4 top-0"
                    :class="{
                      'text-red-400': errors.length > 0,
                      'text-primary-600': errors.length === 0
                    }"
                  >
                    {{ $t('bridge.balance') }}: {{ balanceToFixed }}
                  </span>
                </div>
              </div>
            </div>
            <span
              v-if="showErrorsBelow && errors.length > 0"
              data-cy="reusable-input-bellow-error-text-content"
              class="text-red-400 absolute text-xs mt-[28px]"
            >
              {{ errors[0] }}
            </span>
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
              :wrapper-classes="'shadow-none'"
              :input-classes="'bg-gray-800 rounded-lg'"
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
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import VSelect from 'vue-select'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BankBalanceWithTokenAndBalanceInBase,
  BIG_NUMBER_ROUND_DOWN_MODE
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
      type: String,
      default: ''
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
    }
  },

  data() {
    return {
      search: '',
      isDropdownOpen: false,
      isSearching: false,
      forceClose: true
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

    handleMax(value: string) {
      this.$emit('input:max', value)
    }
  }
})
</script>

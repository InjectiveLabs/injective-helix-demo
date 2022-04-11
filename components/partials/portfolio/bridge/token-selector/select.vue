<template>
  <div>
    <ValidationObserver
      v-slot="{ errors: { amount: inputErrors } }"
      ref="bridge-token-input"
    >
      <v-select
        id="bridge-input-select"
        v-bind="$attrs"
        ref="tokenSelector"
        class="input-select input-token"
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
          <span v-bind="attributes" class="cursor-pointer">
            <v-icon-caret-down-slim />
          </span>
        </template>

        <template #selected-option="{ symbol, logo, name }">
          <ValidationProvider
            v-slot="{ errors, valid }"
            name="amount"
            class="w-full"
            :rules="`required|positiveNumber|between:0.0001,${balanceToFixed}`"
          >
            <div class="flex items-center w-full">
              <v-input
                id="bridge-input"
                dense
                lg
                transparent-bg
                error-below
                type="number"
                step="0.01"
                min="0"
                placeholder="0.0000"
                error-classes="mt-4"
                :errors="errors"
                :valid="valid"
                :max="balanceToFixed"
                :max-decimals="value.decimals"
                :max-selector="balance.gt(0.0001)"
                :value="amount"
                @input="handleAmountChange"
                @blur="resetIsSearching"
                @mousedown.native.stop="focusInput"
              />
              <img
                v-if="logo"
                :src="logo"
                :alt="name"
                class="rounded-full w-6 h-6"
              />
              <v-icon-category-alt v-else class="rounded-full w-6 h-6" />
              <span
                class="font-bold text-lg pl-2 pr-3 text-gray-200 tracking-wide break-normal"
              >
                {{ symbol }}
              </span>
            </div>
          </ValidationProvider>
        </template>

        <template #list-header>
          <li class="mb-4 mt-2">
            <v-input
              id="bridge-input-search"
              v-model="search"
              dense
              round
              :placeholder="$t('common.search')"
              @blur="resetIsSearching"
              @click.native.stop="focusSearchInput"
            >
              <v-icon-search slot="addon" class="w-6 h-6" />
            </v-input>
          </li>
        </template>

        <template #option="item">
          <v-token-selector-item :item="item" />
        </template>
      </v-select>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import vSelect from 'vue-select'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BankBalanceWithTokenAndBalanceInBase,
  BIG_NUMBER_ROUND_DOWN_MODE
} from '@injectivelabs/ui-common'
import VTokenSelectorItem from './item.vue'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    vSelect,
    VTokenSelectorItem,
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

    disabled: {
      type: Boolean,
      required: false,
      default: false
    },

    balance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    value: {
      type: [Object, String, Number],
      default: ''
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
    balanceToFixed(): string {
      const { balance } = this

      return balance.toFixed(
        UI_DEFAULT_DISPLAY_DECIMALS,
        BIG_NUMBER_ROUND_DOWN_MODE
      )
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
    }
  }
})
</script>

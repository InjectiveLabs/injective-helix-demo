<template>
  <div>
    <button
      id="convert-settings-dropdown-target"
      type="button"
      @click="toggleConvertSettingsModal"
    >
      <IconCogwheel
        class="cursor-pointer hover:text-primary-500"
        :class="
          convertSettingsModalActive ? 'text-primary-500' : 'text-gray-500'
        "
      />
    </button>
    <PopperBox
      ref="convert-settings-dropdown"
      class="popper rounded-lg flex flex-col flex-wrap text-xs absolute bg-gray-800 p-4 z-1110 border border-primary-500 shadow-lg w-[calc(100%-6rem)] xs:w-96"
      binding-element="#convert-settings-dropdown-target"
      :options="popperOptions"
      hide-arrow
      disable-auto-close
      @close="hideConvertSettingsModal"
    >
      <div>
        <span class="block font-bold uppercase tracking-widest mb-4">
          {{ $t('trade.convert.advanced_settings') }}
        </span>
        <div class="flex items-center justify-start mb-4">
          <span class="text-gray-500 text-md">
            {{ $t('trade.convert.slippage_tolerance') }}
          </span>
          <IconInfoTooltip
            class="ml-1"
            :tooltip="$t('trade.convert.slippage_tolerance_tooltip')"
          />
        </div>
        <div class="grid grid-cols-7 sm:grid-cols-9 gap-2">
          <SlippagePresetButton
            v-for="(slippageTolerancePreset, index) in slippageTolerancePresets"
            :key="`slippage-tolerance-preset-${index}`"
            :label="slippageTolerancePreset.label"
            :value="slippageTolerancePreset.value"
            :active="
              Number(slippageTolerancePreset.value) === Number(slippageTolerance)
            "
            :class="{
              'hidden sm:block': index === slippageTolerancePresets.length - 1
            }"
            @click="setSlippageTolerance"
          />
          <VInput
            class="col-span-3"
            :value="slippageTolerance"
            :wrapper-classes="wrapperClass"
            :input-classes="inputClass"
            :disabled="false"
            type="number"
            :step="0.01"
            :max-decimals="2"
            :min="0"
            :max="maxSlippageTolerance"
            dense
            small
            :show-prefix="hasWarnings"
            show-addon
            @input="handleInput"
            @blur="handleBlur"
          >
            <IconWarn slot="prefix" :class="warnIconColor" />
            <span slot="addon"> % </span>
          </VInput>
        </div>
        <div v-if="hasWarnings && !hasErrors" class="block mt-4 text-orange-500">
          <span
            v-for="(warning, index) in warnings"
            :key="`slippage-tolerance-warning-${index}`"
          >
            {{ warning }}
          </span>
        </div>
        <div v-if="hasErrors" class="block mt-4 text-red-500">
          <span
            v-for="(error, index) in errors"
            :key="`slippage-tolerance-error-${index}`"
          >
            {{ error }}
          </span>
        </div>
      </div>
    </PopperBox>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import SlippagePresetButton from './slippage-preset-button.vue'
import { DEFAULT_MAX_SLIPPAGE } from '~/app/utils/constants'
import PopperBox from '~/components/elements/popper-box.vue'

export default Vue.extend({
  components: {
    SlippagePresetButton,
    PopperBox
  },

  props: {
    status: {
      type: Status,
      required: true
    },

    warnings: {
      type: Array,
      default: null
    },

    errors: {
      type: Array,
      default: null
    },

    slippageTolerance: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      convertSettingsModalActive: false,
      maxSlippageTolerance: 50,
      slippageTolerancePresets: [
        { label: '0.1', value: '0.1' },
        { label: '0.5', value: '0.5' },
        { label: '1.0', value: '1' }
      ]
    }
  },

  computed: {
    $popper(): any {
      return this.$refs['convert-settings-dropdown']
    },

    popperOptions(): any {
      return {
        placement: 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]
      }
    },

    wrapperClass(): string {
      const { hasWarnings, hasErrors } = this

      if (hasErrors) {
        return 'border-red-500 bg-red-500 bg-opacity-10 border shadow-none'
      }

      if (hasWarnings) {
        return 'border-orange-500 bg-orange-500 bg-opacity-10 border shadow-none'
      }

      return 'border-transparent border shadow-none'
    },

    inputClass(): string {
      const { hasWarnings, hasErrors } = this

      if (hasWarnings || hasErrors) {
        return 'bg-transparent text-right px-1'
      }

      return 'text-right px-1'
    },

    warnIconColor(): string {
      const { hasErrors } = this

      return hasErrors ? 'text-red-500' : 'text-orange-500'
    },

    hasWarnings(): boolean {
      return this.warnings.length > 0
    },

    hasErrors(): boolean {
      return this.errors.length > 0
    }
  },

  methods: {
    handleBlur(value: string): void {
      if (value === '') {
        value = DEFAULT_MAX_SLIPPAGE.toFormat(1)
      }

      this.setSlippageTolerance(value)
    },

    handleInput(value: string): void {
      this.setSlippageTolerance(value)
    },

    setSlippageTolerance(value: string): void {
      this.$emit('set-slippage-tolerance', value)
    },

    toggleConvertSettingsModal(): void {
      if (!this.$popper || this.status.isLoading()) {
        return
      }

      const isActive = this.$popper.$el.hasAttribute('data-show')

      if (isActive) {
        this.$popper.hideDropdown()
        this.convertSettingsModalActive = false
      } else {
        this.$popper.showDropdown()
        this.convertSettingsModalActive = true
      }
    },

    hideConvertSettingsModal(): void {
      this.$popper.hideDropdown()
      this.convertSettingsModalActive = false
    }
  }
})
</script>

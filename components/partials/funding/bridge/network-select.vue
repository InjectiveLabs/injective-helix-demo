<template>
  <div class="relative">
    <h3 class="text-lg text-gray-200 font-semibold mb-4">
      <slot name="title"></slot>
    </h3>
    <v-select
      :id="`network-selector-${uid}`"
      v-bind="$attrs"
      label="text"
      class="input-select input-bridge-selector"
      :auto-scroll="false"
      :clearable="false"
      :reduce="reducer"
      :searchable="false"
      :options="filteredOptions"
      :value="value"
      @input="handleChange"
    >
      <template #open-indicator="{ attributes }">
        <span v-bind="attributes" class="cursor-pointer">
          <v-icon-caret-down-slim />
        </span>
      </template>

      <template #selected-option="{ icon, text }">
        <div class="flex items-center">
          <img
            :src="icon"
            :alt="text"
            class="selected-icon rounded-full mr-3"
          />
          <div>
            <p class="text-2xl tracking-1">{{ text }}</p>
          </div>
        </div>
      </template>

      <template #option="{ icon, text }">
        <div class="flex items-center">
          <img :src="icon" :alt="text" class="rounded-full w-6 h-6 mr-3" />
          <div>
            <p class="text-sm tracking-1">{{ text }}</p>
          </div>
        </div>
      </template>
    </v-select>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import vSelect from 'vue-select'
import { BridgingNetwork, NetworkMeta } from '@injectivelabs/ui-common'
import { networksMeta } from '~/app/data/bridge'

export default Vue.extend({
  components: {
    vSelect
  },

  props: {
    value: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      options: networksMeta as NetworkMeta[]
    }
  },

  computed: {
    uid(): string {
      return window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
    },

    filteredOptions(): Record<string, any>[] {
      const { options, value } = this

      // remove injective option from options
      return options.filter((option) => {
        if (value !== BridgingNetwork.Injective) {
          return option.value !== BridgingNetwork.Injective
        }

        return option.value !== BridgingNetwork.Injective
      })
    }
  },

  methods: {
    reducer(network: { value: string }): string {
      return network.value
    },

    handleChange(network: string) {
      const { value } = this

      if (value !== network) {
        this.$emit('bridging-network:change', network)
      }
    }
  }
})
</script>

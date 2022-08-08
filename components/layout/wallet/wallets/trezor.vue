<template>
  <li>
    <div class="block hover:bg-gray-800 border-gray-600 rounded-lg cursor-pointer" @click="handleClickOnTrezorConnect">
      <div class="flex items-center pl-4 py-4">
        <div class="min-w-0 flex-1 flex items-center">
          <div class="flex-shrink-0 mr-2 text-gray-200">
            <IconTrezor class="w-8 h-8" />
          </div>
          <div class="min-w-0 flex-1 px-4 md:grid md:grid-cols-1 md:gap-4 text-left">
            <div>
              <p class="text-xl font-semibold text-white truncate">
                {{ $t('connect.trezor') }}
              </p>
              <p class="flex items-center text-sm text-gray-500 mt-1">
                <span class="truncate" data-cy="connect-wallet-popup-trezor-button">{{
                  $t('connect.connectUsingHardware')
                  }}</span>
              </p>
            </div>
          </div>
        </div>
        <div>
          <IconCaretDown class="transform -rotate-90 h-5 w-5 text-gray-200" />
        </div>
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {
    //
  },

  data() {
    return {
      isTrezorModalOpen: false
    }
  },

  methods: {
    handleClickOnTrezorConnect() {
      this.$emit('wallet-trezor-connecting')
      this.isTrezorModalOpen = true
    }
  }
})
</script>

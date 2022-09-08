<template>
  <WalletWrapper @click="handleClick">
    <template #icon>
      <IconTorus class="w-8 h-8" />
    </template>
    <template #title>
      {{ $t('connect.torus') }}
    </template>
    <template #description>
      <span data-cy="connect-wallet-popup-torus-button">
        {{ $t('connect.connectUsingTorus') }}
      </span>
    </template>
    <template #addon>
      <div class="ml-4 grid grid-cols-4 gap-4 text-white">
        <IconGoogleSocial class="w-4 h-4" />
        <IconFacebookSocial class="w-4 h-4" />
        <IconTwitterSocial class="w-4 h-4" />
        <IconDiscordSocial class="w-4 h-4" />
      </div>
    </template>
  </WalletWrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import { Wallet } from '@injectivelabs/ts-types'
import WalletWrapper from './wallet-wrapper.vue'
import { WalletConnectStatus } from '~/types'
import { submitWalletSelectedTrackEvent } from '~/app/client/utils/amplitude'

export default Vue.extend({
  components: {
    WalletWrapper
  },

  methods: {
    handleClick() {
      submitWalletSelectedTrackEvent(Wallet.Torus)

      this.$accessor.wallet
        .connectTorus()
        .then(() => {
          this.$emit('wallet-connected')
        })
        .catch((e) => {
          this.$accessor.wallet.setWalletConnectStatus(
            WalletConnectStatus.disconnected
          )
          this.$onError(e)
        })
    }
  }
})
</script>

<script setup lang="ts">
import { GrantAuthorizationWithDecodedAuthorization } from '@injectivelabs/sdk-ts'

const walletStore = useSharedWalletStore()

const props = defineProps({
  granter: {
    type: String,
    required: true
  },

  grants: {
    type: Array as PropType<GrantAuthorizationWithDecodedAuthorization[]>,
    required: true
  }
})

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function connectAuthZ() {
  walletStore.connectAuthZ(props.granter)
}
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-1 flex items-center p-2">
      <span class="font-mono">{{ granter }}</span>
    </div>

    <div class="flex-1 flex items-center p-2">{{ grants.length }}</div>

    <div
      class="flex-1 flex items-center p-2 space-x-2 hover:text-blue-500 rounded-md cursor-pointer select-none"
      @click="toggle"
    >
      <span class="transition-transform" :class="{ 'rotate-180': isOpen }">
        <SharedIcon name="chevron-down" is-sm />
      </span>

      <span>{{ $t('portfolio.settings.authz.viewGrantedFunctions') }}</span>
    </div>

    <div class="flex-1 flex items-center p-2">
      <AppButton
        v-if="walletStore.authZOrInjectiveAddress === granter"
        disabled
        size="sm"
      >
        {{ $t('portfolio.settings.authz.connected') }}
      </AppButton>

      <AppButton v-else-if="walletStore.isAutoSignEnabled" disabled size="sm">
        {{ $t('common.notAvailableinAutoSignMode') }}
      </AppButton>

      <AppButton v-else variant="success" size="sm" @click.stop="connectAuthZ">
        {{ $t('portfolio.settings.authz.connectAs') }}
      </AppButton>
    </div>
  </div>

  <AppCollapse :wrapper-classes="'divide-y bg-black/30'" v-bind="{ isOpen }">
    <PartialsPortfolioSettingsAuthzGranterTableRowGrant
      v-for="grant in grants"
      v-bind="{ grant }"
      :key="`${grant.authorizationType}-${grant.grantee}-${grant.granter}`"
    />
  </AppCollapse>
</template>

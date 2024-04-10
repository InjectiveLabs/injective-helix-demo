<script setup lang="ts">
import { GrantAuthorization } from '@injectivelabs/sdk-ts'

const props = defineProps({
  granter: {
    type: String,
    required: true
  },

  grants: {
    type: Array as PropType<GrantAuthorization[]>,
    required: true
  }
})

const walletStore = useWalletStore()

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
        <BaseIcon name="chevron-down" is-sm />
      </span>

      <span> View Granted Functions </span>
    </div>

    <div class="flex-1 flex items-center p-2" @click.stop="connectAuthZ">
      <AppButton :variant="'success'" size="sm">Connect As</AppButton>
    </div>
  </div>

  <AppCollapse :wrapper-classes="'divide-y bg-black/30'" v-bind="{ isOpen }">
    <PartialsPortfolioSettingsAuthzGranterTableRowGrant
      v-for="grant in grants"
      v-bind="{ grant }"
      :key="`${grant.authorization}-${grant.grantee}-${grant.granter}`"
    />
  </AppCollapse>
</template>

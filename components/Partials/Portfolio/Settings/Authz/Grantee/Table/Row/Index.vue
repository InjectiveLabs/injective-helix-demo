<script setup lang="ts">
import { GrantAuthorization } from '@injectivelabs/sdk-ts'

import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps({
  grantee: {
    type: String,
    required: true
  },

  grants: {
    type: Array as PropType<GrantAuthorization[]>,
    required: true
  }
})

const authZStore = useAuthZStore()

const isOpen = ref(false)
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()

function toggle() {
  isOpen.value = !isOpen.value
}

function revokeAll() {
  status.setLoading()

  authZStore
    .revokeAuthorization({
      grantee: props.grantee,
      messageTypes: props.grants.map(
        (grant) => (grant.authorization as unknown as string).split('/')[1]
      )
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-1 flex items-center p-2">
      <span class="font-mono">{{ grantee }}</span>
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

    <div class="flex-1 flex items-center p-2" @click.stop>
      <AppButton
        v-bind="{ status }"
        :variant="'danger-ghost'"
        size="sm"
        @click="revokeAll"
      >
        Revoke All
      </AppButton>
    </div>
  </div>

  <AppCollapse :wrapper-classes="'divide-y bg-black/30'" v-bind="{ isOpen }">
    <PartialsPortfolioSettingsAuthzGranteeTableRowGrant
      v-for="grant in grants"
      v-bind="{ grant }"
      :key="`${grant.authorization}-${grant.grantee}-${grant.granter}`"
    />
  </AppCollapse>
</template>

<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'

const authZStore = useAuthZStore()
const walletStore = useWalletStore()

const granters = computed(() => [
  ...new Set([...authZStore.granteeGrants.map((grant) => grant.granter)])
])

function connectToGrantee(grantee: string) {
  walletStore.connectAuthZ(grantee)

  /**
   * -- TODO --
   * For now, we reload the page to refetch everything on the
   * page but we should add watchers for better UX
   */
  location.reload()
}
</script>

<template>
  <div>
    <div v-if="granters.length">
      <p class="font-semibold w-full text-xs">
        {{ $t('authZ.granters') }}
      </p>

      <p
        v-for="(granter, index) in granters"
        :key="`granter-${index}`"
        class="flex items-center justify-between my-1"
      >
        <span
          class="font-mono text-3xs"
          :class="{
            'text-gray-200': walletStore.authZ.injectiveAddress !== granter,
            'text-primary-500': walletStore.authZ.injectiveAddress === granter
          }"
        >
          {{ formatWalletAddress(granter) }}
        </span>
        <span>
          <BaseIcon
            name="swap"
            class="hover:text-blue-500 h-4 w-4"
            :class="{
              'text-gray-400': walletStore.authZ.injectiveAddress !== granter,
              'text-primary-500': walletStore.authZ.injectiveAddress === granter
            }"
            @click="connectToGrantee(granter)"
          />
        </span>
      </p>
    </div>
  </div>
</template>

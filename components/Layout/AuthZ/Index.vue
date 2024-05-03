<script lang="ts" setup>
const authZStore = useAuthZStore()
const walletStore = useWalletStore()

const granters = computed(() => [
  ...new Set([...authZStore.granteeGrants.map((grant) => grant.granter)])
])
</script>

<template>
  <div class="flex items-center px-4">
    <BaseHoverMenu
      popper-class="min-w-3xs sm:min-w-2xs bg-gray-850 shadow-dropdown rounded-lg"
    >
      <template #default="{ toggle }">
        <SharedIcon
          name="spy"
          class="w-4 h-4"
          :class="{
            'text-blue-500 hover:text-blue-700':
              walletStore.isAuthzWalletConnected,
            'text-white hover:text-blue-500':
              !walletStore.isAuthzWalletConnected
          }"
          @click="toggle"
        />
      </template>

      <template #content>
        <div class="flex flex-col gap-4 rounded-lg p-4 bg-gray-850">
          <div class="rounded-lg bg-gray-1000">
            <div class="flex flex-col py-3 px-4">
              <div v-if="granters.length">
                <p class="font-semibold w-full text-sm text-gray-100">
                  {{ $t('authZ.granters') }}
                </p>

                <LayoutAuthZGranterOrGrantee
                  v-for="(granter, index) in granters"
                  :key="`granter-${index}`"
                  v-bind="{
                    granterOrGrantee: granter
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseHoverMenu>
  </div>
</template>

<script setup lang="ts">
import {
  GenericAuthorization,
  GrantAuthorizationType,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { DEFAULT_TRUNCATE_LENGTH } from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    grantee: string
    grants: GrantAuthorizationWithDecodedAuthorization[]
  }>(),
  {}
)

const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const isOpen = ref(false)
const status = reactive(new Status(StatusType.Idle))

function toggle() {
  isOpen.value = !isOpen.value
}

function revokeAll() {
  status.setLoading()

  authZStore
    .revokeAuthorization({
      grantee: props.grantee,
      messageTypes: props.grants
        .filter(
          (grant) =>
            /** TODO: filter other types of authorization when we add them */
            grant.authorization &&
            grant.authorizationType.includes(
              GrantAuthorizationType.GenericAuthorization
            )
        )
        .map((grant) => (grant.authorization as GenericAuthorization).msg)
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div class="flex p-2 text-xs hover:bg-brand-875">
    <div class="flex-1 flex items-center p-2 truncate min-w-0">
      <span class="font-mono truncate min-w-0">
        {{ sharedEllipsisFormatText(grantee, DEFAULT_TRUNCATE_LENGTH) }}
      </span>
    </div>

    <div class="xs:flex-1 max-xs:w-10 flex items-center p-2">
      {{ grants.length }}
    </div>

    <div
      class="flex-1 flex items-center p-2 space-x-2 hover:text-blue-500 rounded-md cursor-pointer select-none"
      @click="toggle"
    >
      <span class="transition-transform" :class="{ 'rotate-180': isOpen }">
        <UIcon :name="NuxtUiIcons.ChevronDown" class="h-3 w-3 min-w-3" />
      </span>

      <span> {{ $t('portfolio.settings.authz.viewGrantedFunctions') }} </span>
    </div>

    <div class="xs:flex-1 flex items-center p-2" @click.stop>
      <AppButton
        v-if="
          sharedWalletStore.isAuthzWalletConnected ||
          sharedWalletStore.isAutoSignEnabled
        "
        v-bind="{ status }"
        :variant="'danger-ghost'"
        :tooltip="$t('common.notAvailableinAuthZOrAutoSignMode')"
        size="sm"
        disabled
        class="text-nowrap px-2"
      >
        {{ $t('portfolio.settings.authz.revokeAll') }}
      </AppButton>

      <AppButton
        v-else
        v-bind="{ status }"
        :variant="'danger-ghost'"
        size="sm"
        class="text-nowrap px-2"
        @click="revokeAll"
      >
        {{ $t('portfolio.settings.authz.revokeAll') }}
      </AppButton>
    </div>
  </div>

  <AppCollapse :wrapper-classes="'divide-y bg-black/30'" v-bind="{ isOpen }">
    <PartialsPortfolioSettingsAuthzGranteeTableRowGrant
      v-for="grant in grants"
      v-bind="{ grant }"
      :key="`${grant.authorizationType}-${grant.grantee}-${grant.granter}`"
    />
  </AppCollapse>
</template>

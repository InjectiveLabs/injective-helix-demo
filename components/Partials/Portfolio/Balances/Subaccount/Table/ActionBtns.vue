<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-base'
import { Modal, BusEvents, PortfolioSubPage } from '@/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const sharedWalletStore = useSharedWalletStore()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    token: TokenStatic
    isBridgable?: boolean
    isTablePopover?: boolean
  }>(),
  {}
)

function onDeposit() {
  modalStore.openModal(Modal.Onboard)
}

function onTransfer() {
  modalStore.openModal(Modal.BankTransfer)
  useEventBus(BusEvents.BankTransferModalWithDenom).emit(props.token.denom)
}
</script>

<template>
  <div
    class="flex col-span-2 items-center justify-end text-xs max-lg:pl-4 lg:block"
  >
    <div
      v-if="accountStore.isDefaultSubaccount"
      :class="[
        'shrink-0 flex max-lg:space-x-2',
        isTablePopover ? 'lg:flex-col lg:gap-1.5' : 'lg:gap-2'
      ]"
    >
      <template
        v-if="
          ![Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)
        "
      >
        <PartialsCommonBridgeRedirection
          v-if="isBridgable"
          v-bind="{
            isDeposit: true,
            denom: token.denom
          }"
        >
          <AppButton
            class="max-lg:py-2 lg:w-full lg:leading-snug"
            :variant="lg && isTablePopover ? 'primary-ghost' : 'primary'"
            size="sm"
          >
            {{ $t('common.deposit') }}
          </AppButton>
        </PartialsCommonBridgeRedirection>

        <PartialsCommonBridgeRedirection
          v-if="isBridgable"
          v-bind="{
            denom: token.denom
          }"
        >
          <AppButton
            class="max-lg:py-2 lg:w-full lg:leading-snug"
            :variant="
              lg && isTablePopover ? 'primary-ghost' : 'primary-outline'
            "
            size="sm"
          >
            {{ $t('common.withdraw') }}
          </AppButton>
        </PartialsCommonBridgeRedirection>

        <PartialsCommonBridgeRedirection
          v-if="!lg"
          v-bind="{
            denom: token.denom,
            isTransfer: true
          }"
        >
          <AppButton variant="primary-outline" size="sm" class="py-2">
            {{ $t('common.transfer') }}
          </AppButton>
        </PartialsCommonBridgeRedirection>
      </template>

      <template v-else>
        <AppButton
          class="max-lg:py-2 lg:w-full lg:leading-snug"
          :variant="lg && isTablePopover ? 'primary-ghost' : 'primary'"
          size="sm"
          @click="onDeposit"
        >
          {{ $t('common.deposit') }}
        </AppButton>

        <AppButton
          class="max-lg:py-2 lg:w-full lg:leading-snug"
          :variant="lg && isTablePopover ? 'primary-ghost' : 'primary-outline'"
          size="sm"
          @click="onTransfer"
        >
          {{ $t('common.transfer') }}
        </AppButton>
      </template>
    </div>

    <NuxtLink
      v-else-if="!accountStore.isSgtSubaccount"
      :to="{ name: PortfolioSubPage.Subaccounts }"
    >
      <AppButton
        :class="[
          'max-lg:py-2 lg:leading-snug',
          isTablePopover ? 'lg:w-full' : ''
        ]"
        :variant="lg && isTablePopover ? 'primary-ghost' : 'primary'"
        :to="{ name: PortfolioSubPage.Subaccounts }"
        size="sm"
      >
        {{ $t('common.transfer') }}
      </AppButton>
    </NuxtLink>
  </div>
</template>

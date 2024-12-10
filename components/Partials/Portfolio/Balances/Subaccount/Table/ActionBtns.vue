<script lang="ts" setup>
import { TokenStatic } from '@injectivelabs/sdk-ts'
import { Wallet } from '@injectivelabs/wallet-ts'
import { Modal, BusEvents, PortfolioSubPage } from '@/types'

const { lg } = useTwBreakpoints()
const modalStore = useSharedModalStore()
const accountStore = useAccountStore()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    token: TokenStatic
    isVerified?: boolean
    isBridgable?: boolean
    isTablePopover?: boolean
  }>(),
  {}
)

function onFiatOnRamp() {
  modalStore.openModal(Modal.FiatOnboard)
}

function onTransfer() {
  modalStore.openModal(Modal.BankTransfer)
  useEventBus(BusEvents.BankTransferModalWithDenom).emit(props.token.denom)
}
</script>

<template>
  <div
    class="flex col-span-2 items-center justify-end font-mono text-x max-lg:pl-4 lg:block"
  >
    <div
      v-if="accountStore.isDefaultSubaccount"
      :class="[
        'shrink-0 flex max-lg:space-x-2',
        isTablePopover ? 'lg:flex-col lg:gap-1.5' : 'lg:gap-2'
      ]"
    >
      <template v-if="sharedWalletStore.wallet !== Wallet.Magic">
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
            {{ $t('account.deposit') }}
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
            {{ $t('account.withdraw') }}
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
            {{ $t('account.transfer') }}
          </AppButton>
        </PartialsCommonBridgeRedirection>
      </template>

      <template v-else>
        <AppButton
          class="max-lg:py-2 lg:w-full lg:leading-snug"
          :variant="lg && isTablePopover ? 'primary-ghost' : 'primary'"
          size="sm"
          @click="onFiatOnRamp"
        >
          {{ $t('account.deposit') }}
        </AppButton>

        <AppButton
          class="max-lg:py-2 lg:w-full lg:leading-snug"
          :variant="lg && isTablePopover ? 'primary-ghost' : 'primary-outline'"
          size="sm"
          @click="onTransfer"
        >
          {{ $t('account.transfer') }}
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
        {{ $t('account.transfer') }}
      </AppButton>
    </NuxtLink>
  </div>
</template>

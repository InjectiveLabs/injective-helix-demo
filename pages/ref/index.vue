<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import whitelistedAddressesJson from '@/app/json/referralWhitelistedAddresses.json'

const referralStore = useReferralStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const isUserWhitelisted = computed(() =>
  whitelistedAddressesJson.includes(sharedWalletStore.injectiveAddress)
)

onWalletConnected(() => {
  status.setLoading()

  referralStore
    .fetchUserReferralDetails()
    .then(() => {})
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
</script>

<template>
  <AppHocLoading :status="status" is-full-screen>
    <section class="mx-auto max-w-5xl w-full px-4 py-16 max-sm:py-10">
      <PartialsReferralBeta v-if="!isUserWhitelisted" />
      <PartialsReferralDashboard v-else />
    </section>

    <ModalsCreateReferralLink />
  </AppHocLoading>
</template>

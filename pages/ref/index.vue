<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const referralStore = useReferralStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

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
  <AppHocLoading v-bind="{ status, isFullScreen: true }">
    <section class="mx-auto max-w-5xl w-full px-4 py-16 max-sm:py-10">
      <PartialsReferralDashboard />
    </section>

    <ModalsShareReferral />
    <ModalsCreateReferralLink />
  </AppHocLoading>
</template>

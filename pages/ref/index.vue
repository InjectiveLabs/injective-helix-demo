<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { MainPage } from '@/types'

const router = useRouter()
// const referralStore = useReferralStore()
const sharedWalletStore = useSharedWalletStore()
// const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

// todo fred: update with data when ready
const isUserWhitelisted = computed(() => true)

onMounted(() => {
  if (!sharedWalletStore.isUserConnected) {
    router.push({ name: MainPage.Index })
  } else {
    status.setIdle()

    // todo fred: update with data when ready
    // referralStore
    //   .initReferralData()
    //   .then(() => {})
    //   .catch($onError)
    //   .finally(() => {
    //     status.setIdle()
    //   })
  }
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

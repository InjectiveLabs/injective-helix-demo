<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, BusEvents, LeaderboardDuration } from '@/types'

const modalStore = useModalStore()
const leaderboardStore = useLeaderboardStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    selectedDuration: LeaderboardDuration
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  fetchPnlLeaderboardAccount()
})

function onSharePnl() {
  modalStore.openModal(Modal.SharePnl)

  useEventBus(BusEvents.SharePnlOpened).emit()
}

function fetchPnlLeaderboardAccount() {
  if (!sharedWalletStore.injectiveAddress) {
    return
  }

  status.setLoading()

  leaderboardStore
    .fetchPnlLeaderboardAccount({
      resolution: props.selectedDuration,
      account: sharedWalletStore.injectiveAddress
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <div
    v-if="
      sharedWalletStore.isUserConnected &&
      leaderboardStore.pnlLeaderboardAccount
    "
  >
    <AppHocLoading v-bind="{ status }">
      <PartialsLeaderboardMyStats is-pnl>
        <template #add-on>
          <div
            class="flex bg-white bg-opacity-20 items-center gap-1 p-2 rounded-[4px] cursor-pointer relative"
            @click="onSharePnl"
          >
            <SharedIcon name="share2" class="min-w-4 w-4 h-4 -mt-1" />

            <p class="text-[11px] leading-[13px] font-medium">
              {{ $t('leaderboard.pnl.share') }}
            </p>
          </div>
        </template>

        <template #row>
          <div>
            <div class="hidden md:block">
              <PartialsLeaderboardPnlCommonHeader class="text-[11px]" />
              <PartialsLeaderboardPnlCommonRow
                v-bind="{
                  leader: leaderboardStore.pnlLeaderboardAccount
                }"
                class="text-sm my-1 items-center text-white"
              />
            </div>

            <div class="md:hidden">
              <PartialsLeaderboardPnlMyStatsMobileRow
                v-bind="{
                  leader: leaderboardStore.pnlLeaderboardAccount
                }"
              />
            </div>
          </div>
        </template>
      </PartialsLeaderboardMyStats>
    </AppHocLoading>

    <ModalsSharePnl
      v-if="leaderboardStore.pnlLeaderboardAccount"
      v-bind="{
        selectedDuration,
        pnl: leaderboardStore.pnlLeaderboardAccount.pnl,
        rank: leaderboardStore.pnlLeaderboardAccount.rank
      }"
    />
  </div>
</template>

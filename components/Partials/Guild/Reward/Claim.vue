<script lang="ts" setup>
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  GUILD_VOLUME_REWARD_CONTRACT,
  GUILD_BALANCE_REWARD_CONTRACT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import type { RewardWithToken } from '@/types'
import type { Coin } from '@injectivelabs/sdk-ts'

const campaignStore = useCampaignStore()
const sharedTokenStore = useSharedTokenStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    now: number
    score: string
    rewards?: Coin[]
    decimals: number
    isVolume?: boolean
    percentage: number
    isReadyToClaim?: boolean
  }>(),
  {
    rewards: () => [],
    isVolume: false,
    isReadyToClaim: false
  }
)

const contractAddress = props.isVolume
  ? GUILD_VOLUME_REWARD_CONTRACT
  : GUILD_BALANCE_REWARD_CONTRACT

const hasUserClaimed = ref(false)
const status = reactive(new Status(StatusType.Idle))
const fetchClaimStatus = reactive(new Status(StatusType.Loading))

const hasReward = computed(() =>
  props.rewards.some(({ amount }) => new BigNumberInBase(amount).gt(0))
)

const score = computed(() =>
  sharedToBalanceInToken({
    value: props.score,
    decimalPlaces: props.decimals
  })
)

const rewardsWithToken = computed(
  () =>
    props.rewards
      .map((reward) => {
        const token = sharedTokenStore.tokenByDenomOrSymbol(reward.denom)

        if (!token) {
          return undefined
        }

        return {
          token,
          amount: reward.amount
        }
      })
      .filter((reward) => reward)
      .sort((r1, r2) => {
        const r1Symbol = r1?.token.symbol || ''
        const r2Symbol = r2?.token.symbol || ''

        return r1Symbol.localeCompare(r2Symbol)
      }) as RewardWithToken[]
)

onWalletConnected(() => {
  campaignStore
    .fetchUserClaimedStatus(contractAddress)
    .then((contractClaimedState) => {
      hasUserClaimed.value = contractClaimedState
    })
    .catch($onError)
    .finally(() => fetchClaimStatus.setIdle())
})

function onClaimRewards() {
  status.setLoading()

  campaignStore
    .claimReward(contractAddress)
    .then(() => {
      notificationStore.update({
        title: t('toast.success'),
        description: t('toast.campaign.successfullyClaimedRewards')
      })

      hasUserClaimed.value = true
    })
    .catch((err: any) => {
      if ((err.originalMessage as string).includes('has already claimed')) {
        notificationStore.error({
          title: t('toast.error'),
          description: t('toast.campaign.errorAlreadyClaimed')
        })

        return
      }

      $onError(err)
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
    <div class="max-lg:hidden" />
    <div class="max-md:col-span-2">
      <p class="text-xs pb-2">
        <CommonHeaderTooltip
          v-if="isVolume"
          v-bind="{
            tooltip: $t('guild.leaderboard.table.volumeTooltip')
          }"
        >
          <span class="whitespace-nowrap">
            {{ $t('guild.leaderboard.table.tradingVolume') }}
          </span>
        </CommonHeaderTooltip>

        <CommonHeaderTooltip
          v-else
          v-bind="{
            tooltip: $t('guild.leaderboard.table.tiaBalanceTooltip')
          }"
        >
          <span class="whitespace-nowrap">
            {{ $t('guild.leaderboard.table.weightedAverageTiaBalance') }}
          </span>
        </CommonHeaderTooltip>
      </p>
      <p class="text-sm leading-6">
        <SharedAmountUsd
          v-bind="{
            amount: score,
            shouldAbbreviate: false
          }"
        />
        USD (<SharedAmount
          v-bind="{
            useSubscript: true,
            amount: percentage,
            shouldAbbreviate: false,
            decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
          }"
        />%)
      </p>
    </div>

    <div class="max-xs:col-span-2">
      <p class="text-xs pb-2">
        {{ $t('guild.rewards') }}
      </p>
      <div v-if="hasReward" class="flex items-center gap-2">
        <PartialsGuildRewardDisplay
          v-for="reward in rewardsWithToken"
          :key="`${isVolume ? 'volume' : 'balance'}-${reward.token.symbol}`"
          :reward="reward"
        />
      </div>
      <span v-else>&mdash;</span>
    </div>

    <div
      class="whitespace-nowrap flex items-center justify-end max-xs:col-span-2"
    >
      <AppButton
        class="border border-blue-500"
        size="sm"
        v-bind="{
          isLoading: status.isLoading() || fetchClaimStatus.isLoading(),
          disabled: hasUserClaimed || !isReadyToClaim || !hasReward
        }"
        @click="onClaimRewards"
      >
        <div
          class="font-semibold text-sm"
          :class="{ 'text-blue-500': !hasUserClaimed && isReadyToClaim }"
        >
          {{ $t(`common.${hasUserClaimed ? 'claimed' : 'claim'}`) }}
        </div>
      </AppButton>
    </div>
  </section>
</template>

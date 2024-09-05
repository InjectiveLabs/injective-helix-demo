<script lang="ts" setup>
import { Coin } from '@injectivelabs/sdk-ts'
import {
  BigNumber,
  Status,
  StatusType,
  BigNumberInBase
} from '@injectivelabs/utils'
import { toBalanceInToken } from '@/app/utils/formatters'
import {
  GUILD_VOLUME_REWARD_CONTRACT,
  GUILD_BALANCE_REWARD_CONTRACT
} from '@/app/utils/constants'
import { RewardWithToken } from '@/types'

const tokenStore = useTokenStore()
const campaignStore = useCampaignStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

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

const { valueToString: scoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.score,
      decimalPlaces: props.decimals
    })
  )
)

const { valueToString: percentageToString } = useSharedBigNumberFormatter(
  computed(() => props.percentage),
  {
    roundingMode: BigNumber.ROUND_DOWN
  }
)

const rewardsWithToken = computed(
  () =>
    props.rewards
      .map((reward) => {
        const token = tokenStore.tokenByDenomOrSymbol(reward.denom)

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
      notificationStore.success({
        title: t('campaign.success'),
        description: t('campaign.successfullyClaimedRewards')
      })

      hasUserClaimed.value = true
    })
    .catch((err: any) => {
      if ((err.originalMessage as string).includes('has already claimed')) {
        notificationStore.error({
          title: t('campaign.error'),
          description: t('campaign.errorAlreadyClaimed')
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
        {{ scoreToString }} USD ({{ percentageToString }}%)
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
        v-bind="{
          isSm: true,
          isLoading: status.isLoading() || fetchClaimStatus.isLoading(),
          isDisabled: hasUserClaimed || !isReadyToClaim || !hasReward
        }"
        @click="onClaimRewards"
      >
        <div
          class="font-semibold text-sm"
          :class="{ 'text-blue-500': !hasUserClaimed && isReadyToClaim }"
        >
          {{ $t(`campaign.${hasUserClaimed ? 'claimed' : 'claim'}`) }}
        </div>
      </AppButton>
    </div>
  </section>
</template>

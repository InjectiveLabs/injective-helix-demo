<script lang="ts" setup>
import { BigNumber } from '@injectivelabs/utils'
import { GuildMember } from '@injectivelabs/sdk-ts'
import { getExplorerUrl } from '@/app/utils/network'
import { toBalanceInToken } from '@/app/utils/formatters'
import { GUILD_BASE_TOKEN_SYMBOL } from '@/app/utils/constants'

const { baseToken, quoteToken } = useGuild()

const props = defineProps({
  isCampaignStarted: Boolean,

  rank: {
    type: Number,
    required: true
  },

  member: {
    type: Object as PropType<GuildMember>,
    required: true
  }
})

const explorerLink = computed(
  () => `${getExplorerUrl()}/account/${props.member.address}`
)

const { valueToString: tvlScorePercentageToString } =
  useSharedBigNumberFormatter(
    computed(() => props.member.tvlScorePercentage),
    {
      roundingMode: BigNumber.ROUND_DOWN
    }
  )

const { valueToString: volumeScorePercentageToString } =
  useSharedBigNumberFormatter(
    computed(() => props.member.volumeScorePercentage),
    {
      roundingMode: BigNumber.ROUND_DOWN
    }
  )

const { valueToString: tvlScoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.member.tvlScore,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.member.volumeScore,
      decimalPlaces: quoteToken.value?.decimals || 6
    })
  )
)
</script>

<template>
  <tr class="border-b hover:bg-gray-800 text-sm">
    <td class="p-3">{{ rank }}</td>
    <td>
      <NuxtLink
        :to="explorerLink"
        target="_blank"
        class="text-sm text-blue-500"
      >
        <p class="text-sm text-blue-500 truncate p-3">
          {{ member.address }}
        </p>
      </NuxtLink>
    </td>
    <td class="text-right">
      <div class="p-3">
        <p>
          <span v-if="!isCampaignStarted">&mdash;</span>
          <span v-else>
            {{ tvlScoreToString }}
            {{ baseToken?.symbol || GUILD_BASE_TOKEN_SYMBOL }}
            ({{ tvlScorePercentageToString }}%)
          </span>
        </p>
      </div>
    </td>
    <td class="text-right">
      <div class="p-3">
        <span v-if="!isCampaignStarted">&mdash;</span>
        <span v-else>
          {{ volumeScoreToString }} USD ({{ volumeScorePercentageToString }}%)
        </span>
      </div>
    </td>
  </tr>
</template>

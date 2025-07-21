<script lang="ts" setup>
import { getExplorerUrl } from '@shared/utils/network'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import {
  GUILD_BASE_TOKEN_SYMBOL,
  UI_DEFAULT_MAX_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import type { GuildMember } from '@injectivelabs/sdk-ts'

const { baseToken, quoteToken } = useGuild()

const props = withDefaults(
  defineProps<{
    rank: number
    member: GuildMember
    isCampaignStarted?: boolean
  }>(),
  {
    isCampaignStarted: false
  }
)

const explorerLink = computed(
  () => `${getExplorerUrl()}/account/${props.member.address}`
)

const tvlScore = computed(() =>
  sharedToBalanceInToken({
    value: props.member.tvlScore,
    decimalPlaces: baseToken.value?.decimals || UI_DEFAULT_MAX_DECIMALS
  })
)

const volumeScore = computed(() =>
  sharedToBalanceInToken({
    value: props.member.volumeScore,
    decimalPlaces: quoteToken.value?.decimals || DEFAULT_ASSET_DECIMALS
  })
)
</script>

<template>
  <tr class="border-b hover:bg-coolGray-800 text-sm">
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
            <SharedAmount
              v-bind="{
                amount: tvlScore,
                useSubscript: true,
                shouldAbbreviate: false
              }"
            />
            {{ baseToken?.symbol || GUILD_BASE_TOKEN_SYMBOL }}
            (<SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: member.tvlScorePercentage
              }"
            />%)
          </span>
        </p>
      </div>
    </td>
    <td class="text-right">
      <div class="p-3">
        <span v-if="!isCampaignStarted">&mdash;</span>
        <span v-else>
          <SharedAmountUsd
            v-bind="{
              hideDecimals: true,
              amount: volumeScore,
              shouldAbbreviate: false,
              roundingMode: BigNumberInBase.ROUND_UP
            }"
          />
          USD (<SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: member.volumeScorePercentage,
              decimals: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
          />%)
        </span>
      </div>
    </td>
  </tr>
</template>

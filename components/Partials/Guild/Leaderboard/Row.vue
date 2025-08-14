<script lang="ts" setup>
import { format } from 'date-fns'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_ASSET_DECIMALS } from '@shared/utils/constant'
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import {
  GUILD_BASE_TOKEN_SYMBOL,
  UI_DEFAULT_MAX_DECIMALS
} from '@/app/utils/constants'
import { CampaignSubPage } from '@/types'
import type { Guild, GuildCampaignSummary } from '@injectivelabs/sdk-ts'

const { baseToken, quoteToken } = useGuild()

const props = withDefaults(
  defineProps<{
    rank: number
    guild: Guild
    isVolume?: boolean
    isMyGuild?: boolean
    isCampaignStarted?: boolean
    summary?: GuildCampaignSummary
  }>(),
  {
    summary: undefined,
    isVolume: false,
    isMyGuild: false,
    isCampaignStarted: false
  }
)

const startDate = computed(() => {
  if (!props.summary) {
    return
  }

  return format(props.summary.startTime, 'MMM dd')
})

const tvlScore = computed(() =>
  sharedToBalanceInToken({
    value: props.guild.tvlScore,
    decimalPlaces: baseToken.value?.decimals || UI_DEFAULT_MAX_DECIMALS
  })
)

const volumeScore = computed(() =>
  sharedToBalanceInToken({
    value: props.guild.volumeScore,
    decimalPlaces: quoteToken.value?.decimals || DEFAULT_ASSET_DECIMALS
  })
)
</script>

<template>
  <tr class="border-b hover:bg-coolGray-800 text-sm">
    <td>
      <div class="whitespace-nowrap p-3 block">
        <div v-if="isCampaignStarted" class="flex items-center gap-2">
          <span>{{ rank }}</span>
          <AssetTrophyColor v-if="rank === 1" />
        </div>
        <span v-else>&mdash;</span>
      </div>
    </td>
    <td>
      <div class="p-3 flex items-center gap-2 min-w-[7.5rem]">
        <PartialsGuildThumbnail :thumbnail-id="guild.logo" is-lg />
        <span>{{ guild.name }}</span>
        <div
          v-if="isMyGuild"
          class="px-2 py-0.5 border border-blue-500 text-blue-500 rounded text-xs"
        >
          {{ $t('guild.you') }}
        </div>
      </div>
    </td>
    <td>
      <div class="p-3">
        <PartialsGuildStatus
          v-bind="{
            isCampaignStarted,
            isActive: guild.isActive
          }"
        />
      </div>
    </td>
    <td class="text-right">
      <template v-if="!isCampaignStarted">
        <span v-if="startDate" class="whitespace-nowrap">
          {{ $t('guild.startOn', { date: startDate }) }}
        </span>
        <span v-else>&mdash;</span>
      </template>
      <template v-else>
        <div v-if="isVolume" class="p-3">
          <SharedAmountUsd
            v-bind="{
              hideDecimals: true,
              amount: volumeScore,
              shouldAbbreviate: false,
              roundingMode: BigNumberInBase.ROUND_UP
            }"
          />
          USD
        </div>
        <div v-else class="p-3">
          <SharedAmount
            v-bind="{
              amount: tvlScore,
              useSubscript: true,
              shouldAbbreviate: false
            }"
          />
          {{ baseToken?.symbol || GUILD_BASE_TOKEN_SYMBOL }}
        </div>
      </template>
    </td>
    <td class="text-right">
      <div class="p-3">
        <NuxtLink
          class="text-blue-500 hover:opacity-80"
          :to="{
            name: CampaignSubPage.GuildDetails,
            params: { guild: guild.guildId }
          }"
        >
          <span>{{ $t('common.details') }}</span>
        </NuxtLink>
      </div>
    </td>
  </tr>
</template>

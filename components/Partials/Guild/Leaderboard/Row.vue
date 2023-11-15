<script lang="ts" setup>
import { format } from 'date-fns'
import { Guild, GuildCampaignSummary } from '@injectivelabs/sdk-ts'
import { toBalanceInToken } from '@/app/utils/formatters'
import { GUILD_BASE_TOKEN_SYMBOL } from 'app/utils/constants'
import { CampaignSubPage } from '@/types'

const { baseToken, quoteToken } = useGuild()

const props = defineProps({
  isVolume: Boolean,
  isCampaignStarted: Boolean,

  rank: {
    type: Number,
    required: true
  },

  guild: {
    type: Object as PropType<Guild>,
    required: true
  },

  summary: {
    type: Object as PropType<GuildCampaignSummary>,
    default: undefined
  }
})

const startDate = computed(() => {
  if (!props.summary) {
    return
  }

  return format(props.summary.startTime, 'MMM dd')
})

const { valueToString: tvlScoreToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.guild.tvlScore,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.guild.volumeScore,
      decimalPlaces: quoteToken.value?.decimals || 6
    })
  )
)
</script>

<template>
  <tr class="border-b hover:bg-gray-800 text-sm">
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
        <PartialsGuildThumbnail :thumbnail-id="guild.logo" />
        <span>{{ guild.name }}</span>
      </div>
    </td>
    <td>
      <div class="p-3">
        <AppDotStatus v-if="isCampaignStarted" :is-active="guild.isActive" />
        <AppDotStatus v-else color="text-orange-500">
          {{ $t('common.ready') }}
        </AppDotStatus>
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
        <div v-if="isVolume" class="p-3">{{ volumeScoreToString }} USD</div>
        <div v-else class="p-3">
          {{ tvlScoreToString }}
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

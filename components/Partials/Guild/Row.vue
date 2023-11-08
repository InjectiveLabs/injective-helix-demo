<script lang="ts" setup>
import { Guild } from '@injectivelabs/sdk-ts'
import { toBalanceInToken } from '@/app/utils/formatters'
import { GUILD_BASE_TOKEN_SYMBOL } from 'app/utils/constants'
import { CampaignPage } from '@/types'

const tokenStore = useTokenStore()

const props = defineProps({
  guild: {
    type: Object as PropType<Guild>,
    required: true
  }
})

const baseToken = computed(() =>
  tokenStore.tokens.find(({ symbol }) => symbol === GUILD_BASE_TOKEN_SYMBOL)
)

const { valueToString: tvlScoreToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.guild.tvlScore,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useBigNumberFormatter(
  computed(() => props.guild.volumeScore)
)
</script>

<template>
  <tr class="border-b hover:bg-gray-800 text-sm">
    <td>
      <div class="p-3 flex items-center gap-2">
        <span>{{ guild.rankByTvl }}</span>
        <AssetTrophyColor />
      </div>
    </td>
    <td>
      <div class="p-3">{{ guild.name }}</div>
    </td>
    <td>
      <div class="p-3"><AppDotStatus :is-active="guild.isActive" /></div>
    </td>
    <td class="text-right">
      <div class="p-3">{{ tvlScoreToString }} INJ</div>
    </td>
    <td class="text-right">
      <div class="p-3">{{ volumeScoreToString }} USD</div>
    </td>
    <td class="text-right">
      <div class="p-3">
        <NuxtLink
          class="text-blue-500 hover:opacity-80"
          :to="{
            name: CampaignPage.GuildDetails,
            params: { guild: guild.guildId }
          }"
        >
          <span>{{ $t('common.details') }}</span>
        </NuxtLink>
      </div>
    </td>
  </tr>
</template>

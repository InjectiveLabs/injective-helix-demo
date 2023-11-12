<script lang="ts" setup>
import { GuildMember } from '@injectivelabs/sdk-ts'
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { toBalanceInToken } from '@/app/utils/formatters'
import { NETWORK, GUILD_BASE_TOKEN_SYMBOL } from 'app/utils/constants'

const tokenStore = useTokenStore()

const props = defineProps({
  member: {
    type: Object as PropType<GuildMember>,
    required: true
  }
})

const explorerLink = computed(
  () => `${getExplorerUrl(NETWORK)}/account/${props.member.address}`
)

const baseToken = computed(() =>
  tokenStore.tokens.find(({ symbol }) => symbol === GUILD_BASE_TOKEN_SYMBOL)
)

const { valueToString: tvlScoreToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.member.tvlScore,
      decimalPlaces: baseToken.value?.decimals || 18
    })
  )
)

const { valueToString: volumeScoreToString } = useBigNumberFormatter(
  computed(() => props.member.volumeScore)
)
</script>

<template>
  <tr class="border-b hover:bg-gray-800 text-sm">
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
        {{ tvlScoreToString }} {{ baseToken?.symbol || 'INJ' }}
      </div>
    </td>
    <td class="text-right">
      <div class="p-3">{{ volumeScoreToString }} USD</div>
    </td>
  </tr>
</template>

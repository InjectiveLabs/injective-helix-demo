<script lang="ts" setup>
import { getExplorerUrl } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { NETWORK } from '@/app/utils/constants'

const props = defineProps({
  rank: {
    type: Number,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  percentage: {
    type: String,
    required: true
  },

  volume: {
    type: String,
    required: true
  }
})

const avatarSrc = ref('')

const explorerUrl = computed(
  () => `${getExplorerUrl(NETWORK)}/account/${props.address}/?tab=transactions`
)

const percentage = computed(() => Number(props.percentage))
const volumeInBase = computed(() => new BigNumberInBase(props.volume))

const { valueToString: volumeInBaseToFormat } = useBigNumberFormatter(
  volumeInBase,
  {
    decimalPlaces: 2
  }
)
</script>

<template>
  <div
    class="grid grid-cols-6 md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 items-center h-14 border-b border-gray-700"
  >
    <div
      class="text-sm col-span-1 md:col-span-2 flex items-center justify-start"
    >
      <span class="font-semibold mr-2">
        {{ rank }}
      </span>
      <AssetTrophyColor v-if="rank <= 3" class="min-w-4 w-4 h-4" />
    </div>

    <div
      class="font-mono flex items-center justify-start col-span-3 md:col-span-3 overflow-hidden"
      data-cy="markets-last-traded-price-table-data"
    >
      <div
        v-if="avatarSrc"
        class="min-w-6 min-h-6 w-6 h-6 rounded-full overflow-hidden mr-2"
      >
        <img :src="avatarSrc" />
      </div>
      <div v-else class="min-w-6 min-h-6 w-6 h-6 rounded-full bg-white mr-2" />
      <span
        class="text-white whitespace-nowrap overflow-hidden overflow-ellipsis"
      >
        {{ address }}
      </span>
    </div>

    <span class="block font-mono text-right col-span-2 md:col-span-2 text-sm">
      <span class="text-white overflow-ellipsis whitespace-nowrap">
        {{ volumeInBaseToFormat }} USD
      </span>
    </span>

    <span class="hidden md:block col-span-1" />

    <div class="hidden md:block font-mono text-right col-span-2 text-sm">
      <AppProgress :value="percentage" />
    </div>

    <div class="hidden md:block col-span-2 text-right">
      <a
        :href="explorerUrl"
        target="_blank"
        class="text-blue-500 cursor-pointer whitespace-nowrap overflow-ellipsis"
      >
        {{ $t('leaderboard.viewOnExplorer') }}
      </a>
    </div>
  </div>
</template>

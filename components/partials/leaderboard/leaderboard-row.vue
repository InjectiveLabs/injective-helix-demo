<template>
  <div
    class="grid grid-cols-10 3md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 items-center h-14 border-b border-helixGray-500"
  >
    <div class="text-sm col-span-2 flex items-center justify-start">
      <span class="font-semibold mr-2">
        {{ rank }}
      </span>
      <IconTrophyColor v-if="rank <= 3" class="min-w-4 w-4 h-4" />
    </div>

    <span
      class="hidden font-mono sm:flex items-center justify-start col-span-2"
      data-cy="markets-last-traded-price-table-data"
    >
      <div v-if="avatarSrc" class="min-w-6 min-h-6 w-6 h-6 rounded-full overflow-hidden mr-2">
        <img :src="avatarSrc" />
      </div>
      <div v-else class="min-w-6 min-h-6 w-6 h-6 rounded-full bg-white mr-2" />
      <span class="text-white">
        {{ formattedAddress }}
      </span>
    </span>

    <span class="hidden sm:block font-mono text-right col-span-3 text-sm">
      <span class="text-white"> {{ formattedVolume }} USD </span>
    </span>

    <span class="hidden sm:block col-span-1" />

    <div class="hidden sm:block font-mono text-right col-span-2 text-sm">
      <Progress :value="percentage" />
    </div>

    <div class="hidden sm:block col-span-2 text-right">
      <a
        :href="explorerUrl"
        target="_blank"
        class="text-primary-500 cursor-pointer"
      >
        {{ $t('leaderboard.viewOnExplorer') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import identicon from 'identicon'

import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import Progress from '~/components/elements/progress.vue'

export default Vue.extend({
  components: {
    Progress
  },

  props: {
    rank: {
      type: Number,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    perc: {
      type: String,
      required: true
    },

    volume: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      avatarSrc: ''
    }
  },

  computed: {
    formattedAddress(): string {
      const { address } = this

      return (
        address.slice(0, 6) +
        '......' +
        address.slice(address.length - 6, address.length)
      )
    },

    percentage(): Number {
      const { perc } = this

      return Number(perc)
    },

    formattedVolume(): string {
      const { volume } = this

      const volumeInBase = new BigNumberInBase(volume)

      return volumeInBase.toFormat(2)
    },

    explorerUrl(): string {
      const { address } = this

      return `https://explorer.injective.network/account/${address}`
    }
  },

  mounted() {
    const { address } = this

    this.generateAvatar(address)
      .then((buffer: string) => {
        this.avatarSrc = buffer
      })
  },

  methods: {
    generateAvatar(value: string): Promise<string> {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        identicon.generate({ id: value, size: 24 }, (err, buffer) => {
          if (err) {
            return reject(err)
          }

          resolve(buffer)
        })
      })
    }
  }
})
</script>

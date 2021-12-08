<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.ranking.evcsTitle') }}
    </h3>

    <div class="flex items-center">
      <h4 class="text-gray-500 text-xs">
        {{ $t('dmm.ranking.marketRewardFactor') }}
      </h4>
      <v-icon-info-tooltip
        lg
        class="ml-3 mr-4"
        color="text-gray-200"
        :tooltip="$t('dmm.tooltip.evcsRewardFactor')"
      />
      <p class="text-gray-200 text-xl">{{ rewardFactor }}</p>
    </div>

    <div class="rounded-2xl mt-4 overflow-y-hidden">
      <TableHeader sm dense>
        <span class="col-span-4">
          {{ $t('dmm.ranking.address') }}
        </span>

        <div class="col-span-4 flex items-center relative">
          <span>{{ $t('dmm.ranking.volume') }}</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.tooltip.volume')"
          />
        </div>

        <div class="col-span-4 flex items-center relative">
          <span>{{ $t('dmm.ranking.evcs') }}</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.tooltip.evcs')"
          />
        </div>
      </TableHeader>

      <TableBody
        class="max-h-60 overflow-y-scroll"
        :class="[
          formattedMarket > 5 ? 'md:overflow-y-scroll' : 'md:overflow-y-hidden'
        ]"
        :show-empty="formattedMarket.length === 0"
        dense
      >
        <VEvcsRow
          v-for="(item, index) in formattedMarket"
          :key="`rank-evcs-${index}`"
          :active="injectiveAddress === item.address"
          :item="item"
          :scrollbar="formattedMarket > 5"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-3 text-center xl:text-left">
            {{ $t('dmm.common.emptyResult') }}
          </span>
        </template>
      </TableBody>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MapOfStringDMMVCS } from '@injectivelabs/exchange-consumer'
import VEvcsRow from './evcs-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import { UiDmmMarketMaker, UIEpochMarketEVCSItem } from '~/types'
import { UI_DEFAULT_DMM_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    VEvcsRow
  },

  props: {
    rewardFactor: {
      type: String,
      required: true
    }
  },

  computed: {
    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    activeMarketId(): string {
      return this.$accessor.dmm.activeMarketId
    },

    marketMakers(): UiDmmMarketMaker[] {
      return this.$accessor.dmm.marketMakers
    },

    vcsMarketMap(): Record<string, MapOfStringDMMVCS> {
      return this.$accessor.dmm.vcs.byMarketsMap
    },

    vcs(): MapOfStringDMMVCS | undefined {
      const { activeMarketId, vcsMarketMap } = this

      if (!vcsMarketMap) {
        return undefined
      }

      return vcsMarketMap[activeMarketId]
    },

    formattedMarket(): UIEpochMarketEVCSItem[] {
      const { vcs, marketMakers } = this

      if (!vcs) {
        return []
      }

      return Object.entries(vcs)
        .map(([name, vcs]) => {
          const marketMaker = marketMakers.find(
            ({ name: dmmName }) => name === dmmName
          )

          return {
            name,
            address: marketMaker ? marketMaker.address : '',
            volume: new BigNumberInBase(vcs.volume).toFormat(
              UI_DEFAULT_DMM_DECIMALS
            ),
            evcs: new BigNumberInBase(vcs.vcs).toFormat(UI_DEFAULT_DMM_DECIMALS)
          }
        })
        .sort((v1: UIEpochMarketEVCSItem, v2: UIEpochMarketEVCSItem) => {
          const v1Evcs = new BigNumberInBase(v1.evcs.replace(',', ''))
          const v2Evcs = new BigNumberInBase(v2.evcs.replace(',', ''))

          return v2Evcs.minus(v1Evcs).toNumber()
        })
    }
  }
})
</script>

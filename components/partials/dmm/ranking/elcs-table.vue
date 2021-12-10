<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.ranking.elcsTitle') }}
    </h3>

    <div class="flex items-center">
      <h4 class="text-gray-500 text-xs">
        {{ $t('dmm.ranking.marketRewardFactor') }}
      </h4>
      <v-icon-info-tooltip
        lg
        class="ml-3 mr-4"
        color="text-gray-200"
        :tooltip="$t('dmm.tooltip.elcsRewardFactor')"
      />
      <p class="text-gray-200 text-xl">{{ rewardFactor }}</p>
    </div>

    <div class="rounded-2xl mt-4 overflow-y-hidden">
      <TableHeader sm dense>
        <span class="col-span-4">
          {{ $t('dmm.ranking.address') }}
        </span>

        <div class="col-span-3 flex items-center relative">
          <span>{{ $t('dmm.ranking.elcsBuy') }}</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.tooltip.buyScore')"
          />
        </div>

        <div class="col-span-3 flex items-center relative">
          <span>{{ $t('dmm.ranking.elcsSell') }}</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.tooltip.sellScore')"
          />
        </div>

        <div class="col-span-2 flex items-center relative">
          <span>{{ $t('dmm.ranking.elcs') }}</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.tooltip.elcs')"
          />
        </div>
      </TableHeader>
      <TableBody
        class="max-h-60 overflow-y-scroll"
        :class="[
          formattedMarket.length > 5
            ? 'md:overflow-y-scroll'
            : 'md:overflow-y-hidden'
        ]"
        :show-empty="formattedMarket.length === 0"
        dense
      >
        <TableRow
          v-for="(item, index) in formattedMarket"
          :key="`market-elcs-${index}`"
          :active="injectiveAddress === item.address"
          :item="item"
          :scrollbar="formattedMarket.length > 5"
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
import { DMMLCS } from '@injectivelabs/exchange-consumer'
import TableRow from './elcs-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import { UiDmmMarketMaker, UIEpochMarketELCSItem } from '~/types'
import { UI_DEFAULT_DMM_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    TableRow
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

    lcsMarketMap(): Record<string, Record<string, DMMLCS>> {
      return this.$accessor.dmm.lcs.byMarketsMap
    },

    lcs(): Record<string, DMMLCS> | undefined {
      const { activeMarketId, lcsMarketMap } = this

      if (!lcsMarketMap) {
        return undefined
      }

      return lcsMarketMap[activeMarketId]
    },

    formattedMarket(): UIEpochMarketELCSItem[] {
      const { lcs, marketMakers } = this

      if (!lcs) {
        return []
      }

      return Object.entries(lcs)
        .map(([name, lcs]) => {
          const marketMaker = marketMakers.find(
            ({ name: dmmName }) => name === dmmName
          )

          return {
            name,
            address: marketMaker ? marketMaker.address : '',
            buy: new BigNumberInBase(lcs.normBuy).toFormat(
              UI_DEFAULT_DMM_DECIMALS
            ),
            sell: new BigNumberInBase(lcs.normSell).toFormat(
              UI_DEFAULT_DMM_DECIMALS
            ),
            elcs: new BigNumberInBase(lcs.lcs).toFormat(UI_DEFAULT_DMM_DECIMALS)
          }
        })
        .sort((v1: UIEpochMarketELCSItem, v2: UIEpochMarketELCSItem) => {
          const v1Elcs = new BigNumberInBase(v1.elcs.replace(',', ''))
          const v2Elcs = new BigNumberInBase(v2.elcs.replace(',', ''))

          return v2Elcs.minus(v1Elcs).toNumber()
        })
    }
  }
})
</script>

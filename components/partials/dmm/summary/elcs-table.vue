<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.summary.elcsTitle') }}
    </h3>

    <div class="flex items-center sm:items-end mt-4 flex-wrap">
      <h4 class="text-gray-500 text-xs uppercase">
        {{ $t('dmm.summary.elcsTotalTokens') }}
      </h4>
      <p class="text-gray-200 text-xl mx-4 leading-5.5">
        {{ totalInjInString }}
      </p>

      <p class="text-gray-500 text-xs mt-2 sm:mt-0">
        ({{
          $t('dmm.summary.elcsTotalTokensPercentage', {
            percentage: formattedRatio
          })
        }})
      </p>
    </div>

    <div class="rounded-2xl mt-4 overflow-y-hidden">
      <TableHeader is-elcs :latest="isLatestEpoch" />
      <TableBody
        class="max-h-60 overflow-y-scroll"
        :class="[
          formattedSummary.length > 5
            ? 'md:overflow-y-scroll'
            : 'md:overflow-y-hidden'
        ]"
        :show-empty="formattedSummary.length === 0"
        dense
      >
        <TableRow
          v-for="(item, index) in formattedSummary"
          :key="`summary-elcs-${index}`"
          is-elcs
          :active="injectiveAddress === item.address"
          :item="item"
          :latest="isLatestEpoch"
          :scrollbar="formattedSummary.length > 5"
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
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DMMLCS } from '@injectivelabs/exchange-consumer'
import { UiDmmMarketMaker, UiEpochDate, UiEpochSummaryItem } from '~/types'
import TableHeader from '~/components/partials/dmm/summary/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import TableRow from '~/components/partials/dmm/summary/table-row.vue'
import { UI_DEFAULT_DMM_DECIMALS, ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    TableRow
  },

  props: {
    totalInj: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    ratio: {
      type: String,
      required: true
    }
  },

  computed: {
    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    activeEpochId(): string {
      return this.$accessor.dmm.activeEpochId
    },

    epochDates(): UiEpochDate[] {
      return this.$accessor.dmm.dates
    },

    epochUsdPrice(): Number {
      return this.$accessor.dmm.epochUsdPrice
    },

    marketMakers(): UiDmmMarketMaker[] {
      return this.$accessor.dmm.marketMakers
    },

    lcsSummary(): Record<string, DMMLCS> {
      return this.$accessor.dmm.lcs.summaryMap
    },

    totalLcs(): BigNumberInBase {
      const { lcsSummary } = this

      if (!lcsSummary) {
        return ZERO_IN_BASE
      }

      return Object.values(lcsSummary).reduce(
        (total, lcs) => total.plus(new BigNumberInBase(lcs.lcs)),
        ZERO_IN_BASE
      )
    },

    formattedSummary(): UiEpochSummaryItem[] {
      const {
        epochUsdPrice,
        lcsSummary,
        totalInj,
        totalLcs,
        marketMakers
      } = this

      if (!lcsSummary) {
        return []
      }

      return Object.entries(lcsSummary)
        .map(([name, lcs]) => {
          const marketMaker = marketMakers.find(
            ({ name: dmmName }) => name === dmmName
          )
          const total = new BigNumberInBase(lcs.lcs)
          const totalPercentage = total.dividedBy(totalLcs).times(100)
          const rewardInInj = totalPercentage.dividedBy(100).times(totalInj)
          const rewardInUsd = rewardInInj.times(
            new BigNumberInBase(epochUsdPrice.toString())
          )

          return {
            name,
            address: marketMaker ? marketMaker.address : '',
            total: total.gt(0) ? total.toFormat(UI_DEFAULT_DMM_DECIMALS) : '0',
            totalPercentage: total.gt(0)
              ? totalPercentage.toFormat(UI_DEFAULT_DMM_DECIMALS)
              : '0',
            rewardInInj: total.gt(0)
              ? rewardInInj.toFormat(UI_DEFAULT_DMM_DECIMALS)
              : '0',
            rewardInUsd: total.gt(0)
              ? rewardInUsd.toFormat(UI_DEFAULT_DMM_DECIMALS)
              : '0'
          }
        })
        .sort((v1: UiEpochSummaryItem, v2: UiEpochSummaryItem) => {
          const v1Total = new BigNumberInBase(v1.total.replace(',', ''))
          const v2Total = new BigNumberInBase(v2.total.replace(',', ''))

          return v2Total.minus(v1Total).toNumber()
        })
    },

    formattedRatio(): string {
      const { ratio } = this

      return new BigNumberInBase(ratio).times(100).toFormat()
    },

    totalInjInString(): string {
      const { totalInj } = this

      return totalInj.toFormat()
    },

    isLatestEpoch(): boolean {
      const { activeEpochId, epochDates } = this

      return epochDates.findIndex(({ id }) => activeEpochId === id) === 0
    }
  }
})
</script>

<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { isWithinInterval } from 'date-fns'
import { usdtToken } from '@shared/data/token'
import { getHubUrl } from '@shared/utils/network'
import { NOTIFI_LINK } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  BusEvents,
  TradePage,
  NoticeBanner,
  PortfolioSubPage,
  LeaderboardSubPage
} from '@/types'

type Banner = {
  id: string
  shouldDisplay: boolean
  shouldPersist?: boolean
}

const ftmPairs = [
  {
    slug: 'omni-usdt-perp',
    marketId:
      '0x4d42425fc3ccd6b61b8c4ad61134ab3cf21bdae1b665317eff671cfab79f4387'
  }
]

const route = useRoute()
const appStore = useAppStore()
const accountStore = useAccountStore()
const jsonStore = useSharedJsonStore()
const sharedWalletStore = useSharedWalletStore()
const now = useNow({ interval: 1000 })

const isHideBanner = ref(false)

const ftmBanners = computed<Banner[]>(() => [
  {
    shouldPersist: true,
    id: NoticeBanner.FTMSettleMarket,
    shouldDisplay:
      (route.name as string)?.startsWith(TradePage.Futures) &&
      ftmPairs.some(
        ({ slug, marketId }) =>
          slug === route.params.slug || marketId === route.query.marketId
      )
  }
])
const chainUpgradeBanners = computed<Banner[]>(() => [
  {
    shouldPersist: true,
    id: NoticeBanner.PostChainUpgrade,
    shouldDisplay: jsonStore.isPostUpgradeMode
  },
  {
    shouldPersist: true,
    id: NoticeBanner.UpcomingChainUpgrade,
    shouldDisplay: jsonStore.hasUpcomingChainUpgrade
  }
])

const promotionalBanners = computed<Banner[]>(() => [
  {
    // todo: replace this banner with new UX after Ned comes back with the design
    shouldPersist: true,
    id: NoticeBanner.AuthzConnected,
    shouldDisplay: sharedWalletStore.isAuthzWalletConnected
  },
  {
    id: NoticeBanner.OwnYourAssetCampaign,
    shouldDisplay:
      !appStore.userState.bannersViewed.includes(
        NoticeBanner.OwnYourAssetCampaign
      ) &&
      isWithinInterval(now.value, {
        end: new Date(1733497200000),
        start: new Date(1732633200000)
      })
  },
  {
    id: NoticeBanner.NeptuneUsdt,
    shouldDisplay:
      !appStore.userState.bannersViewed.includes(NoticeBanner.NeptuneUsdt) &&
      new BigNumberInBase(accountStore.balancesMap[usdtToken.denom]).gt(0)
  }
])

const bannerToDisplay = computed(
  () =>
    [
      ...ftmBanners.value,
      ...chainUpgradeBanners.value,
      ...promotionalBanners.value
    ].filter((banner) => banner.shouldDisplay)[0]
)

function openNeptuneUsdtModal() {
  useEventBus(BusEvents.NeptuneUsdt).emit()
  onHideBanner()
}

function onHideBanner() {
  isHideBanner.value = true

  if (!bannerToDisplay.value) {
    return
  }

  if (bannerToDisplay.value.shouldPersist) {
    return
  }

  appStore.setUserState({
    ...appStore.userState,
    bannersViewed: [
      ...appStore.userState.bannersViewed,
      bannerToDisplay.value.id
    ]
  })
}
</script>

<template>
  <div
    v-if="bannerToDisplay && !isHideBanner"
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-1.5 text-sm justify-between relative z-40 font-semibold"
  >
    <div />

    <template v-if="bannerToDisplay.id === NoticeBanner.FTMSettleMarket">
      {{ $t('banners.ftmSettleMarket') }}
    </template>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.NeptuneUsdt"
      tag="p"
      keypath="trade.neptuneUsdt.banner"
      class="font-semibold text-sm md:text-md flex-1 text-center"
    >
      <template #here>
        <NuxtLink
          :to="{
            name: PortfolioSubPage.Balances,
            query: {
              depositUsdt: 'true'
            }
          }"
          class="hover:opacity-80 underline cursor-pointer"
          @click="openNeptuneUsdtModal"
        >
          {{ $t('trade.neptuneUsdt.here') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.OwnYourAssetCampaign"
      keypath="banners.ownYourAssetCompetition"
      tag="p"
    >
      <template #linkDescription>
        <NuxtLink
          class="inline-flex font-semibold"
          :to="{ name: LeaderboardSubPage.Competition }"
        >
          {{ $t('banners.ownYourAssetCompetitionLink') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.AuthzConnected"
      keypath="banners.authz"
      tag="p"
    >
      <template #address>
        <strong>{{ sharedWalletStore.authZOrInjectiveAddress }}</strong>
      </template>
    </i18n-t>

    <div
      v-if="
        bannerToDisplay.id === NoticeBanner.UpcomingChainUpgrade &&
        jsonStore.chainUpgradeConfig.proposalId &&
        jsonStore.chainUpgradeConfig.proposalMsg
      "
      class="flex items-center gap-1"
    >
      <p>{{ jsonStore.chainUpgradeConfig.proposalMsg }}</p>
      <NuxtLink
        target="_blank"
        class="hover:opacity-80 underline cursor-pointer"
        :to="`${getHubUrl()}/proposal/${
          jsonStore.chainUpgradeConfig.proposalId
        }`"
      >
        {{ $t('banners.findOutMore') }}
      </NuxtLink>
    </div>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.PostChainUpgrade"
      keypath="banners.postOnly"
      tag="p"
    >
      <template #link>
        <NuxtLink
          :to="NOTIFI_LINK"
          target="_blank"
          class="hover:opacity-80 underline cursor-pointer"
        >
          {{ $t('banners.findOutMore') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <UIcon
      v-if="bannerToDisplay.id === NoticeBanner.AuthzConnected"
      :name="NuxtUiIcons.Exit"
      class="text-blue-900 h-6 w-6 min-w-6"
      @click="sharedWalletStore.resetAuthZ()"
    />

    <UIcon
      v-else
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="onHideBanner"
    />
  </div>
</template>

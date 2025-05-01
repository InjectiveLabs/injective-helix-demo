<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { isWithinInterval } from 'date-fns'
import { getHubUrl } from '@shared/utils/network'
import { NOTIFI_LINK } from '@shared/utils/constant'
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
    slug: 'om-usdt-perp',
    marketId:
      '0xdcfdb105edb27c8be6cdbf25906f424d31b9db3d69876cdd9bcfc475660f1006'
  }
]

const route = useRoute()
const appStore = useAppStore()
const jsonStore = useSharedJsonStore()
const sharedWalletStore = useSharedWalletStore()
const now = useNow({ interval: 1000 })

const isHideBanner = ref(false)
const bannersToHide = ref<string[]>([])

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
    id: NoticeBanner.OwnYourAssetCampaign,
    shouldDisplay:
      !appStore.userState.bannersViewed.includes(
        NoticeBanner.OwnYourAssetCampaign
      ) &&
      isWithinInterval(now.value, {
        end: new Date(1733497200000),
        start: new Date(1732633200000)
      })
  }
  // {
  //   id: NoticeBanner.NeptuneUsdt,
  //   shouldDisplay:
  //     !appStore.userState.bannersViewed.includes(NoticeBanner.NeptuneUsdt) &&
  //     new BigNumberInBase(accountStore.balancesMap[usdtToken.denom]).gt(0)
  // }
])

const bannerToDisplay = computed(
  () =>
    [
      ...ftmBanners.value,
      ...chainUpgradeBanners.value,
      ...promotionalBanners.value
    ].filter(
      (banner) =>
        banner.shouldDisplay && !bannersToHide.value.includes(banner.id)
    )[0]
)

function openNeptuneUsdtModal() {
  useEventBus(BusEvents.NeptuneUsdt).emit()
  onHideBanner()
}

function onHideBanner() {
  if (!bannerToDisplay.value) {
    return
  }

  bannersToHide.value.push(bannerToDisplay.value?.id)

  if (bannerToDisplay.value?.shouldPersist) {
    return
  }

  appStore.setUserState({
    ...appStore.userState,
    bannersViewed: [
      ...appStore.userState.bannersViewed,
      bannerToDisplay.value?.id
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
      {{ $t('banners.ftmMarketBanner') }}
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
      v-else
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="onHideBanner"
    />
  </div>
</template>

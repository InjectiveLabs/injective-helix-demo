<script lang="ts" setup>
import { getHubUrl } from '@shared/utils/network'
import { Wallet } from '@injectivelabs/wallet-base'
import { NOTIFI_LINK } from '@shared/utils/constant'
import { format, isBefore, isWithinInterval } from 'date-fns'
import { NuxtUiIcons, SharedMarketType } from '@shared/types'
import { trackUtmStockTwitsBanner } from '@/app/providers/mixpanel/EventTracker'
import {
  DEFAULT_TRUNCATE_LENGTH,
  DEPRECATED_WALLET_DOCS_LINK
} from '@/app/utils/constants'
import { TradePage, UtmSource, NoticeBanner, LeaderboardSubPage } from '@/types'

type Banner = {
  id: string
  shouldDisplay: boolean
  shouldPersist?: boolean
}

const perpSettlePairs = [
  // {
  //   slug: 'wti-usdt-perp',
  //   marketId:
  //     '0x12ea31cc591984150dd2341f593c0bd3e57e3e057e8bd692806b7ac092ac529c',
  //   newExpiryLaunch: true
  // }
] as { slug: string; marketId: string; newExpiryLaunch: boolean }[]

const preLaunchMarketPairs = [
  {
    slug: 'mon-usdt-perp',
    marketId:
      '0xf90a62bb82fdce5ae1a1388227999a78d24546541fd7c586e1e0d3f150eaf385'
  },
  {
    slug: 'apr-usdt-perp',
    marketId:
      '0xefae35bb70165a67953413cdd429a61a04feb9c3275edc2334adb1c8e693f3d8'
  }
] as { slug: string; marketId: string }[]

const route = useRoute()
const appStore = useAppStore()
const jsonStore = useSharedJsonStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const now = useNow({ interval: 1000 })
const { t } = useLang()
const { copy } = useClipboard()

const isHideBanner = ref(false)
const bannersToHide = ref<NoticeBanner[]>([])

const formattedTurnkeyInjectiveAddress = computed(() =>
  sharedEllipsisFormatText(
    sharedWalletStore.turnkeyInjectiveAddress,
    DEFAULT_TRUNCATE_LENGTH
  )
)

const deprecatedWarningBanner = computed<Banner[]>(() => [
  {
    id: NoticeBanner.DeprecatedWallet,
    shouldDisplay:
      sharedWalletStore.isUserConnected &&
      sharedWalletStore.wallet === Wallet.Magic,
    shouldPersist: true
  }
])

const activePerpSettlePairs = computed(() =>
  perpSettlePairs.find(
    ({ slug, marketId }) =>
      slug === route.params.slug || marketId === route.query.marketId
  )
)

const mkrMigrationBanner = computed<Banner[]>(() => [
  {
    id: NoticeBanner.MKRMigration,
    shouldDisplay:
      route.params.slug === 'mkr-usdt-perp' ||
      route.query.marketId ===
        '0x142d0fa4506b5f404bcfdd54567797ff6767dce07afaedc90d379665f09f0520',
    shouldPersist: true
  }
])

const expiryFutureSettlementTimestamp = computed(() => {
  if (!(route.name as string)?.startsWith(TradePage.Futures)) {
    return undefined
  }

  const market = derivativeStore.marketByIdOrSlug(route.params.slug as string)

  if (
    !market ||
    market.subType !== SharedMarketType.Futures ||
    !market?.expiryFuturesMarketInfo?.expirationTimestamp
  ) {
    return undefined
  }

  return market.expiryFuturesMarketInfo.expirationTimestamp
})

const expiryFutureBanner = computed(() => [
  {
    id: NoticeBanner.ExpiryFutures,
    shouldPersist: true,
    shouldDisplay:
      expiryFutureSettlementTimestamp.value &&
      isBefore(now.value, expiryFutureSettlementTimestamp.value * 1000)
  }
])

const perpMarketSettleBanner = computed<Banner[]>(() => [
  {
    shouldPersist: true,
    id: NoticeBanner.PerpSettleMarket,
    shouldDisplay:
      (route.name as string)?.startsWith(TradePage.Futures) &&
      activePerpSettlePairs.value !== undefined
  }
])

const activePreLaunchFuturesBanner = computed<Banner[]>(() => [
  {
    shouldPersist: true,
    id: NoticeBanner.PreLaunchFutures,
    shouldDisplay:
      (route.name as string)?.startsWith(TradePage.Futures) &&
      preLaunchMarketPairs.some(
        ({ slug, marketId }) =>
          slug === route.params.slug || marketId === route.query.marketId
      )
  }
])

const chainUpgradeBanners = computed<Banner[]>(() => [
  {
    shouldPersist: true,
    id: NoticeBanner.PostChainUpgrade,
    shouldDisplay:
      jsonStore.isPostUpgradeMode && sharedWalletStore.isUserConnected
  },
  {
    shouldPersist: true,
    id: NoticeBanner.UpcomingChainUpgrade,
    shouldDisplay:
      jsonStore.hasUpcomingChainUpgrade && sharedWalletStore.isUserConnected
  }
])

const promotionalBanners = computed<Banner[]>(() => [
  {
    id: NoticeBanner.VolumeVictoryCampaign,
    shouldDisplay:
      !appStore.userState.bannersViewed.includes(
        NoticeBanner.VolumeVictoryCampaign
      ) &&
      isWithinInterval(now.value, {
        end: new Date(1761242400000), // Thursday, October 23, 2025 6:00:00 PM UTC
        start: new Date(1760032800000) // Thursday, October 9, 2025 6:00:00 PM UTC
      })
  },
  {
    id: NoticeBanner.StockTwits,
    shouldDisplay:
      sharedWalletStore.isUserConnected &&
      route.query.utm_source === UtmSource.StockTwits &&
      !appStore.userState.bannersViewed.includes(NoticeBanner.StockTwits)
  }
])

const bannerToDisplay = computed(
  () =>
    [
      ...mkrMigrationBanner.value,
      ...deprecatedWarningBanner.value,
      ...expiryFutureBanner.value,
      ...perpMarketSettleBanner.value,
      ...activePreLaunchFuturesBanner.value,
      ...chainUpgradeBanners.value,
      ...promotionalBanners.value
    ].filter(
      (banner) =>
        !bannersToHide.value.includes(banner.id as NoticeBanner) &&
        banner.shouldDisplay
    )[0]
)

watch(
  () => bannerToDisplay.value?.id,
  (id) => {
    if (id === NoticeBanner.StockTwits) {
      const routeQuery = route.query

      trackUtmStockTwitsBanner({
        isBannerShown: true,
        walletType: sharedWalletStore.wallet,
        utmMedium: routeQuery?.utm_medium as string,
        utmCampaign: routeQuery?.utm_campaign as string,
        utmSourcePlatform: routeQuery?.utm_source_platform as string
      })
    }
  },
  { immediate: true }
)

// function openNeptuneUsdtModal() {
//   useEventBus(BusEvents.NeptuneUsdt).emit()
//   onHideBanner()
// }

function onHideBanner() {
  bannersToHide.value.push(bannerToDisplay.value?.id as NoticeBanner)

  if (!bannerToDisplay.value || bannerToDisplay.value?.shouldPersist) {
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

function onCopyAddress() {
  copy(sharedWalletStore.turnkeyInjectiveAddress)
  notificationStore.success({ title: t('toast.copiedAddressToClipboard') })
}

function onClickStockTwitsCta() {
  const routeQuery = route.query

  trackUtmStockTwitsBanner({
    isCtaClicked: true,
    isBannerShown: true,
    walletType: sharedWalletStore.wallet,
    utmMedium: routeQuery?.utm_medium as string,
    utmCampaign: routeQuery?.utm_campaign as string,
    utmSourcePlatform: routeQuery?.utm_source_platform as string
  })
}
</script>

<template>
  <div
    v-if="bannerToDisplay && !isHideBanner"
    :class="[
      jsonStore.isPostUpgradeMode ? 'justify-center' : 'justify-between'
    ]"
    class="bg-blue-400 text-blue-900 flex items-center px-3 py-1.5 text-sm relative z-40 font-semibold"
  >
    <div />

    <template v-if="bannerToDisplay.id === NoticeBanner.PerpSettleMarket">
      <span v-if="activePerpSettlePairs?.newExpiryLaunch">
        {{ $t('banners.settlePerpMarketBannerNewLaunch') }}
      </span>
      <span v-else>
        {{ $t('banners.settlePerpMarketBanner') }}
      </span>
    </template>

    <!-- for future reference as per PR feedback -->
    <!-- <i18n-t
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
          {{ $t('common.here') }}
        </NuxtLink>
      </template>
    </i18n-t> -->

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.VolumeVictoryCampaign"
      tag="p"
      keypath="banners.leaderboard.currentCompetitionTitle"
    >
      <template #linkDescription>
        <NuxtLink
          class="inline-flex font-semibold hover:text-black/70 underline transition-colors"
          :to="{ name: LeaderboardSubPage.Competition }"
        >
          {{ $t('banners.leaderboard.currentCompetitionLink') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.DeprecatedWallet"
      tag="p"
      class="flex items-center gap-1"
      :keypath="
        sharedWalletStore.turnkeyInjectiveAddress
          ? 'banners.deprecatedWalletWithAddress'
          : 'banners.deprecatedWallet'
      "
    >
      <template #address>
        <div class="flex items-center gap-2">
          <span>{{ formattedTurnkeyInjectiveAddress }}</span>
          <UIcon
            :name="NuxtUiIcons.Copy2"
            class="hover:text-white h-4 w-4"
            @click.stop="onCopyAddress"
          />
        </div>
      </template>

      <template #learnMore>
        <NuxtLink
          class="hover:opacity-80 underline cursor-pointer"
          target="_blank"
          :to="DEPRECATED_WALLET_DOCS_LINK"
          @click="onClickStockTwitsCta"
        >
          {{ $t('common.learnMore') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <div
      v-if="
        jsonStore.chainUpgradeConfig.proposalId &&
        jsonStore.chainUpgradeConfig.proposalMsg &&
        bannerToDisplay.id === NoticeBanner.UpcomingChainUpgrade
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
      v-if="bannerToDisplay.id === NoticeBanner.StockTwits"
      tag="p"
      keypath="banners.stockTwits"
    >
      <template #learnMore>
        <NuxtLink
          class="hover:opacity-80 underline cursor-pointer"
          target="_blank"
          to="https://docs.helixapp.com/getting-started"
          @click="onClickStockTwitsCta"
        >
          {{ $t('common.learnMore') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.PostChainUpgrade"
      tag="p"
      keypath="banners.postOnly"
    >
      <template #link>
        <NuxtLink
          target="_blank"
          :to="NOTIFI_LINK"
          class="hover:opacity-80 underline cursor-pointer"
        >
          {{ $t('banners.findOutMore') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.PreLaunchFutures"
      tag="p"
      keypath="banners.prelaunchFuturesBanner"
    >
      <template #docs>
        <NuxtLink
          target="_blank"
          to="https://docs.helixapp.com/trading/pre-launch-futures"
          class="hover:opacity-80 underline cursor-pointer"
        >
          {{ $t('banners.docs') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <template v-if="bannerToDisplay.id === NoticeBanner.PointsS1Ended">
      <span>
        {{ $t('banners.pointsS1Ended') }}
      </span>
    </template>

    <template v-if="bannerToDisplay.id === NoticeBanner.MKRMigration">
      <span>
        {{ $t('banners.mkrExpiry') }}
      </span>
    </template>

    <template
      v-if="
        bannerToDisplay.id === NoticeBanner.ExpiryFutures &&
        expiryFutureSettlementTimestamp
      "
    >
      <span>
        {{
          $t('banners.expiryFuturesBanner', {
            date: format(
              expiryFutureSettlementTimestamp * 1000,
              "HH:mm 'on' MM/dd"
            )
          })
        }}
      </span>
    </template>

    <UIcon
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="onHideBanner"
    />
  </div>
</template>

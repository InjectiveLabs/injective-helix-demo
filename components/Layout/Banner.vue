<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { getHubUrl } from '@shared/utils/network'
import { Wallet } from '@injectivelabs/wallet-base'
import { NOTIFI_LINK } from '@shared/utils/constant'
import { trackUtmStockTwitsBanner } from '@/app/providers/mixpanel/EventTracker'
import {
  DEFAULT_TRUNCATE_LENGTH,
  DEPRECATED_WALLET_DOCS_LINK
} from '@/app/utils/constants'
import { TradePage, UtmSource, NoticeBanner } from '@/types'

type Banner = {
  id: string
  shouldDisplay: boolean
  shouldPersist?: boolean
}

const perpSettlePairs = [
  {
    slug: 'wti-usdt-perp',
    marketId:
      '0x12ea31cc591984150dd2341f593c0bd3e57e3e057e8bd692806b7ac092ac529c',
    newExpiryLaunch: true
  },
  {
    slug: 'imcd-usdt-perp',
    marketId:
      '0x056fd86c5b8bde4a4f03552e281db86fc6c110a13a79b98b2011aa84bb0ec340',
    newExpiryLaunch: false
  },
  {
    slug: 'plume-usdt-perp',
    marketId:
      '0x3569a541bfae59b8a92215e3cb31133bff21455f1a18a1303df87fecab2839e4',
    newExpiryLaunch: false
  },
  {
    slug: 'launchcoin-usdt-perp',
    marketId:
      '0x99fb44dc75753727f89bad0e79b8b9d2a69ab3cf62730ac405cfd3611569dbc0',
    newExpiryLaunch: false
  },
  {
    slug: 'axl-usdt-perp',
    marketId:
      '0x4fe7aff4dd27be7cbb924336e7fe2d160387bb1750811cf165ce58d4c612aebb',
    newExpiryLaunch: false
  },
  {
    slug: 'sign-usdt-perp',
    marketId:
      '0xc6c7178a6f1fa18007f81e5c8dce85be3dbce97cca68ee97321de0daf7558c6a',
    newExpiryLaunch: false
  }
] as { slug: string; marketId: string; newExpiryLaunch: boolean }[]

const route = useRoute()
const appStore = useAppStore()
const jsonStore = useSharedJsonStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { copy } = useClipboard()

const isHideBanner = ref(false)

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

const perpMarketSettleBanners = computed<Banner[]>(() => [
  {
    shouldPersist: true,
    id: NoticeBanner.PerpSettleMarket,
    shouldDisplay:
      (route.name as string)?.startsWith(TradePage.Futures) &&
      activePerpSettlePairs.value !== undefined
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
  // {
  //   id: NoticeBanner.OwnYourAssetCampaign,
  //   shouldDisplay:
  //     !appStore.userState.bannersViewed.includes(
  //       NoticeBanner.OwnYourAssetCampaign
  //     ) &&
  //     isWithinInterval(now.value, {
  //       end: new Date(1733497200000),
  //       start: new Date(1732633200000)
  //     })
  // },
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
      ...deprecatedWarningBanner.value,
      ...perpMarketSettleBanners.value,
      ...chainUpgradeBanners.value,
      ...promotionalBanners.value
    ].filter((banner) => banner.shouldDisplay)[0]
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
    </i18n-t>

    <i18n-t
      v-if="bannerToDisplay.id === NoticeBanner.OwnYourAssetCampaign"
      tag="p"
      keypath="banners.leaderboard.currentCompetitionLink"
    >
      <template #linkDescription>
        <NuxtLink
          class="inline-flex font-semibold"
          :to="{ name: LeaderboardSubPage.Competition }"
        >
          {{ $t('banners.leaderboard.currentCompetitionTitle') }}
        </NuxtLink>
      </template>
    </i18n-t> -->

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
      v-if="bannerToDisplay.id === NoticeBanner.PointsS1Ended"
      tag="p"
      keypath="banners.pointsS1Ended"
    >
      <template #link>
        <NuxtLink
          target="_blank"
          to="https://docs.helixapp.com/points"
          class="hover:opacity-80 underline cursor-pointer"
        >
          {{ $t('banners.pointsS1EndedLink') }}
        </NuxtLink>
      </template>
    </i18n-t>

    <div v-if="bannerToDisplay.shouldPersist" />

    <UIcon
      v-else
      :name="NuxtUiIcons.Close"
      class="h-4 w-4 min-w-4 hover:text-white"
      @click="onHideBanner"
    />
  </div>
</template>

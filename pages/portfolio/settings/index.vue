<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Wallet } from '@injectivelabs/wallet-base'
import { PortfolioSubPage, SettingsPreferences } from '@/types'

const appStore = useAppStore()
const sharedWalletStore = useSharedWalletStore()
const { t } = useLang()

const preferencesList = computed(() => {
  const isMagicOrTurnkeyWallet = [Wallet.Magic, Wallet.Turnkey].includes(
    sharedWalletStore.wallet
  )

  // note: temporarily comment thousands separator because https://injective-labs.atlassian.net/browse/IL-1650
  const list: Record<string, any> = [
    // {
    //   type: SettingsPreferences.ThousandsSeparators,
    //   title: t('portfolio.settings.preferences.thousandsSeparator.title'),
    //   description: t(
    //     'portfolio.settings.preferences.thousandsSeparator.description'
    //   )
    // },
    {
      type: SettingsPreferences.GridTradingSubaccounts,
      title: t('portfolio.settings.preferences.gridTradingSubaccounts.title'),
      description: t(
        'portfolio.settings.preferences.gridTradingSubaccounts.description'
      )
    },
    {
      type: SettingsPreferences.AutoSign,
      title: t('portfolio.autoSign.title'),
      description: t('portfolio.settings.preferences.autosign.description'),
      tooltipText: t('portfolio.settings.preferences.autosign.tooltip'),
      tooltipLink: 'https://docs.helixapp.com/trading/auto-sign',
      isDisabled:
        isMagicOrTurnkeyWallet ||
        sharedWalletStore.isEip712 ||
        sharedWalletStore.isAuthzWalletConnected
    }
  ]

  if (appStore.devMode) {
    list.splice(2, 0, {
      type: SettingsPreferences.Eip712,
      title: t('portfolio.settings.preferences.eip712.title')
    })
  }

  return list
})
</script>

<template>
  <div>
    <div class="mt-6 ml-4">
      <h3 class="portfolio-title">{{ $t('portfolio.settings.title') }}</h3>
    </div>

    <div class="mt-8">
      <h4 class="font-bold mb-2 pl-4">
        {{ $t('portfolio.settings.preferences.title') }}
      </h4>

      <PartialsPortfolioSettingsToggler
        v-for="(item, index) in preferencesList"
        :key="index"
        v-bind="{
          type: item.type,
          title: item.title,
          isDisabled: item.isDisabled,
          description: item.description,
          tooltipText: item.tooltipText,
          tooltipLink: item.tooltipLink
        }"
      />
    </div>

    <div class="mt-8">
      <h4 class="font-bold mb-2 pl-4">
        {{ $t('portfolio.settings.account') }}
      </h4>

      <div class="border-b">
        <NuxtLink
          :to="{ name: PortfolioSubPage.SettingsAuthz }"
          class="p-4 sm:pr-6 flex justify-between items-center hover:bg-brand-850 gap-4"
        >
          <div>
            <h3 class="font-medium text-sm text-white">
              {{ $t('portfolio.authZ.title') }}
            </h3>
            <p class="text-xs text-coolGray-350 mt-2">
              {{ $t('portfolio.authZ.description') }}
            </p>
          </div>

          <UIcon
            :name="NuxtUiIcons.ChevronLeft"
            class="h-4 w-4 min-w-4 rotate-180"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

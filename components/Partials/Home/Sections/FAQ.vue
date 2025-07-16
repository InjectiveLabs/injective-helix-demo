<script setup lang="ts">
import { PortfolioSubPage } from '~/types'
import { NuxtUiIcons } from '@shared/types'

const { t } = useI18n()

const faqList = computed(() => [
  {
    label: t('home.faq.accordion1.title'),
    slot: 'accordion-1'
  },
  {
    label: t('home.faq.accordion2.title'),
    slot: 'accordion-2'
  },
  {
    label: t('home.faq.accordion3.title'),
    slot: 'accordion-3'
  },
  {
    label: t('home.faq.accordion4.title'),
    slot: 'accordion-4'
  },
  {
    label: t('home.faq.accordion5.title'),
    slot: 'accordion-5'
  },
  {
    label: t('home.faq.accordion6.title'),
    slot: 'accordion-6'
  }
])
</script>

<template>
  <div
    class="relative mt-24 lg:mt-32 pb-8 flex flex-col items-center max-w-[830px] mx-auto"
  >
    <div id="faq-title" class="mb-2 lg:mb-6">
      <h1 class="text-2xl lg:text-5xl font-semibold text-center">
        {{ $t('home.faq.title') }}
      </h1>
    </div>

    <UAccordion
      v-bind="{
        items: faqList,
        color: 'white',
        variant: 'ghost',
        openIcon: NuxtUiIcons.ChevronDownCircle,
        ui: {
          container: 'border-b border-b-coolGray-475 last:border-b-0',
          default: {
            truncate: false,
            class:
              'text-lg lg:text-[22px] px-0 pt-6 pb-4 dark:hover:bg-transparent font-semibold text-left'
          },
          item: {
            size: 'text-sm',
            color: 'text-white',
            padding: 'pt-0 pb-4',
            base: 'leading-[1.1]',
            icon: 'lg:!size-8 max-lg:!size-7'
          }
        }
      }"
    >
      <template #accordion-1>
        <p>
          {{ $t('home.faq.accordion1.description') }}
        </p>
      </template>

      <template #accordion-2>
        <p>
          {{ $t('home.faq.accordion2.description') }}
        </p>

        <br />

        <ul class="faq-description-list">
          <li>
            <i18n-t tag="p" keypath="home.faq.accordion2.option1">
              <template #settings>
                <NuxtLink
                  class="faq-link"
                  :to="{ name: PortfolioSubPage.SettingsAuthz }"
                >
                  {{ $t('home.faq.accordion2.settings') }}
                </NuxtLink>
              </template>
            </i18n-t>
          </li>
          <li>{{ $t('home.faq.accordion2.option2') }}</li>
          <li>{{ $t('home.faq.accordion2.option3') }}</li>
        </ul>
      </template>

      <template #accordion-3>
        <p>
          {{ $t('home.faq.accordion3.description') }}
        </p>
      </template>

      <template #accordion-4>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion4.featureTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li>
              <i18n-t tag="p" keypath="home.faq.accordion4.feature1">
                <template #spotMarkets>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/spot"
                  >
                    {{ $t('home.faq.accordion4.spotMarkets') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion4.feature2">
                <template #oneHundredLeverage>
                  <strong>{{
                    $t('home.faq.accordion4.oneHundredLeverage')
                  }}</strong>
                </template>

                <template #perpetualMarkets>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/futures"
                  >
                    {{ $t('home.faq.accordion4.perpetualMarkets') }}
                  </NuxtLink>
                </template>

                <template #stocks>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/futures/stocks"
                  >
                    {{ $t('home.faq.accordion4.stocks') }}
                  </NuxtLink>
                </template>

                <template #commodities>
                  <strong>{{ $t('home.faq.accordion4.commodities') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion4.feature3">
                <template #tradingBots>
                  <strong>{{ $t('home.faq.accordion4.tradingBots') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion4.feature4">
                <template #lpRewards>
                  <strong>{{ $t('home.faq.accordion4.lpRewards') }}</strong>
                </template>

                <template #makerRebates>
                  <strong>{{ $t('home.faq.accordion4.makerRebates') }}</strong>
                </template>

                <template #feeDiscounts>
                  <strong>{{ $t('home.faq.accordion4.feeDiscounts') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion4.feature5">
                <template #autoSigning>
                  <strong>{{ $t('home.faq.accordion4.autoSigning') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion4.feature6">
                <template #tradingCompetitions>
                  <strong>
                    {{ $t('home.faq.accordion4.tradingCompetitions') }}
                  </strong>
                </template>
              </i18n-t>
            </li>
          </ul>
        </div>
      </template>

      <template #accordion-5>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion5.optionTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li>
              <i18n-t tag="p" keypath="home.faq.accordion5.option1">
                <template #fiatOnRamps>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://bridge.injective.network/fiat"
                  >
                    {{ $t('home.faq.accordion5.fiatOnRamps') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion5.option2">
                <template #injectiveBridge>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://bridge.injective.network/"
                  >
                    {{ $t('home.faq.accordion5.injectiveBridge') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>{{ $t('home.faq.accordion5.option3') }}</li>
          </ul>
        </div>
      </template>

      <template #accordion-6>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion6.stepTitle') }}
          </p>

          <br />

          <ol class="faq-steps-list">
            <li>
              <i18n-t tag="p" keypath="home.faq.accordion6.step1">
                <template #helix>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/"
                  >
                    {{ $t('home.faq.accordion6.helix') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion6.step2">
                <template #usdt>
                  <strong>
                    {{ $t('home.faq.accordion6.usdt') }}
                  </strong>
                </template>
                <template #inj>
                  <strong>
                    {{ $t('home.faq.accordion6.inj') }}
                  </strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion6.step3">
                <template #spot>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/spot"
                  >
                    {{ $t('home.faq.accordion6.spot') }}
                  </NuxtLink>
                </template>

                <template #perpetual>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/futures"
                  >
                    {{ $t('home.faq.accordion6.perpetual') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion6.step4">
                <template #limit>
                  <strong>
                    {{ $t('home.faq.accordion6.limit') }}
                  </strong>
                </template>
                <template #marketOrder>
                  <strong>
                    {{ $t('home.faq.accordion6.marketOrder') }}
                  </strong>
                </template>
              </i18n-t>
            </li>
          </ol>

          <br />

          <i18n-t
            tag="p"
            class="leading-tight"
            keypath="home.faq.accordion6.cta"
          >
            <template #tutorial>
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://www.youtube.com/watch?v=uEhCbu8L2o0"
              >
                {{ $t('home.faq.accordion6.videoTutorialHere') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<style>
.faq-link {
  @apply underline hover:text-white/70 transition-colors font-bold;
}

.faq-description-list,
.faq-steps-list {
  @apply pl-4;

  li {
    @apply leading-relaxed;
  }
}

.faq-description-list {
  @apply list-disc;
}

.faq-steps-list {
  @apply list-decimal;
}
</style>

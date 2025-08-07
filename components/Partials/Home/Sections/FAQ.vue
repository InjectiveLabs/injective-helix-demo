<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import {
  HELIX_APP_STORE_LINK,
  HELIX_PLAY_STORE_LINK
} from '@/app/data/marketInfo'

const { t } = useLang()

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
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion1.featureTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li>
              <i18n-t tag="p" keypath="home.faq.accordion1.feature1">
                <template #spotMarkets>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/spot"
                  >
                    {{ $t('home.faq.accordion1.spotMarkets') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion1.feature2">
                <template #oneHundredLeverage>
                  <strong>{{
                    $t('home.faq.accordion1.oneHundredLeverage')
                  }}</strong>
                </template>

                <template #perpetualMarkets>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/futures"
                  >
                    {{ $t('home.faq.accordion1.perpetualMarkets') }}
                  </NuxtLink>
                </template>

                <template #stocks>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/futures/stocks"
                  >
                    {{ $t('home.faq.accordion1.stocks') }}
                  </NuxtLink>
                </template>

                <template #commodities>
                  <strong>{{ $t('home.faq.accordion1.commodities') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion1.feature3">
                <template #tradingBots>
                  <strong>{{ $t('home.faq.accordion1.tradingBots') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion1.feature4">
                <template #lpRewards>
                  <strong>{{ $t('home.faq.accordion1.lpRewards') }}</strong>
                </template>

                <template #makerRebates>
                  <strong>{{ $t('home.faq.accordion1.makerRebates') }}</strong>
                </template>

                <template #feeDiscounts>
                  <strong>{{ $t('home.faq.accordion1.feeDiscounts') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion1.feature5">
                <template #autoSigning>
                  <strong>{{ $t('home.faq.accordion1.autoSigning') }}</strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion1.feature6">
                <template #tradingCompetitions>
                  <strong>
                    {{ $t('home.faq.accordion1.tradingCompetitions') }}
                  </strong>
                </template>
              </i18n-t>
            </li>
          </ul>
        </div>
      </template>

      <template #accordion-2>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion2.optionTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li>
              <i18n-t tag="p" keypath="home.faq.accordion2.option1">
                <template #fiatOnRamps>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://bridge.injective.network/fiat"
                  >
                    {{ $t('home.faq.accordion2.fiatOnRamps') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion2.option2">
                <template #injectiveBridge>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://bridge.injective.network/"
                  >
                    {{ $t('home.faq.accordion2.injectiveBridge') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>{{ $t('home.faq.accordion2.option3') }}</li>
          </ul>
        </div>
      </template>

      <template #accordion-3>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion3.stepTitle') }}
          </p>

          <br />

          <ol class="faq-steps-list">
            <li>
              <i18n-t tag="p" keypath="home.faq.accordion3.step1">
                <template #helix>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/"
                  >
                    {{ $t('home.faq.accordion3.helix') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion3.step2">
                <template #usdt>
                  <strong>
                    {{ $t('home.faq.accordion3.usdt') }}
                  </strong>
                </template>
                <template #inj>
                  <strong>
                    {{ $t('home.faq.accordion3.inj') }}
                  </strong>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion3.step3">
                <template #spot>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/spot"
                  >
                    {{ $t('home.faq.accordion3.spot') }}
                  </NuxtLink>
                </template>

                <template #perpetual>
                  <NuxtLink
                    target="_blank"
                    class="faq-link"
                    to="https://helixapp.com/futures"
                  >
                    {{ $t('home.faq.accordion3.perpetual') }}
                  </NuxtLink>
                </template>
              </i18n-t>
            </li>

            <li>
              <i18n-t tag="p" keypath="home.faq.accordion3.step4">
                <template #limit>
                  <strong>
                    {{ $t('home.faq.accordion3.limit') }}
                  </strong>
                </template>
                <template #marketOrder>
                  <strong>
                    {{ $t('home.faq.accordion3.marketOrder') }}
                  </strong>
                </template>
              </i18n-t>
            </li>
          </ol>

          <br />

          <i18n-t tag="p" keypath="home.faq.accordion3.cta">
            <template #tutorial>
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://www.youtube.com/watch?v=uEhCbu8L2o0"
              >
                {{ $t('home.faq.accordion3.videoTutorialHere') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </div>
      </template>

      <template #accordion-4>
        <i18n-t tag="p" keypath="home.faq.accordion4.description">
          <template #appStore>
            <NuxtLink
              target="_blank"
              class="faq-link"
              :to="HELIX_APP_STORE_LINK"
            >
              {{ $t('home.faq.accordion4.appStore') }}
            </NuxtLink>
          </template>

          <template #playStore>
            <NuxtLink
              target="_blank"
              class="faq-link"
              :to="HELIX_PLAY_STORE_LINK"
            >
              {{ $t('home.faq.accordion4.playStore') }}
            </NuxtLink>
          </template>
        </i18n-t>
      </template>

      <template #accordion-5>
        <p>
          {{ $t('home.faq.accordion5.description') }}
        </p>

        <br />

        <ul class="faq-description-list">
          <li>{{ $t('home.faq.accordion5.option1') }}</li>
          <li>{{ $t('home.faq.accordion5.option2') }}</li>
          <li>{{ $t('home.faq.accordion5.option3') }}</li>
        </ul>
      </template>

      <template #accordion-6>
        <p>
          {{ $t('home.faq.accordion6.description') }}
        </p>
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

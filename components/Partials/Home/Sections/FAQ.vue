<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

const { t } = useI18n()

const faqList = [
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
    content: t('home.faq.accordion4.content1')
  },
  {
    label: t('home.faq.accordion5.title'),
    slot: 'accordion-5'
  },
  {
    label: t('home.faq.accordion6.title'),
    slot: 'accordion-6'
  },
  {
    label: t('home.faq.accordion7.title'),
    slot: 'accordion-7'
  }
]

const helixFeatures = [
  `${t('home.faq.accordion2.feature1.section1')} <a href="http://helixapp.com/spot" class="faq-link" target="_blank">${t('home.faq.accordion2.feature1.section2')}</a>${t('home.faq.fullstop')}`,
  `${t('home.faq.accordion2.feature2.section1')} <strong>${t('home.faq.accordion2.feature2.section2')}</strong> ${t('home.faq.on')} <a href="https://helixapp.com/futures" class="faq-link" target="_blank">${t('home.faq.accordion2.feature2.section3')}</a>, ${t('home.faq.accordion2.feature2.section4')}, <a href="https://helixapp.com/futures/btc-usdt-perp/?category=iAssets" class="faq-link" target="_blank">${t('home.faq.accordion2.feature2.section5')}</a>, ${t('home.faq.and')} <strong>${t('home.faq.accordion2.feature2.section6')}</strong> ${t('home.faq.accordion2.feature2.section7')}`,
  `${t('home.faq.accordion2.feature3.section1')} <strong>${t('home.faq.accordion2.feature3.section2')}</strong> ${t('home.faq.accordion2.feature3.section3')}`,
  `${t('home.faq.accordion2.feature4.section1')} <strong>${t('home.faq.accordion2.feature4.section2')}</strong>, <strong>${t('home.faq.accordion2.feature4.section3')}</strong>, ${t('home.faq.and')} <strong>${t('home.faq.accordion2.feature4.section4')}</strong> ${t('home.faq.accordion2.feature4.section5')}`,
  `${t('home.faq.accordion2.feature5.section1')} <strong>${t('home.faq.accordion2.feature5.section2')}</strong> ${t('home.faq.accordion2.feature5.section3')}`,
  `${t('home.faq.accordion2.feature6.section1')} <strong>${t('home.faq.accordion2.feature6.section2')}</strong> ${t('home.faq.accordion2.feature6.section3')}`
]

const getAssetsOptions = [
  `${t('home.faq.accordion5.option1.section1')} <a href="https://bridge.injective.network/fiat" class="faq-link" target="_blank">${t('home.faq.accordion5.option1.section2')}</a> ${t('home.faq.accordion5.option1.section3')}`,
  `${t('home.faq.accordion5.option2.section1')} <a href="http://bridge.injective.network" class="faq-link" target="_blank">${t('home.faq.accordion5.option2.section2')}</a> ${t('home.faq.accordion5.option2.section3')}`,
  `${t('home.faq.accordion5.option3')}`
]

const tradeSteps = [
  `${t('home.faq.accordion6.step1.section1')} <a href="https://helixapp.com/" class="faq-link" target="_blank">${t('home.faq.accordion6.step1.section2')}</a> ${t('home.faq.accordion6.step1.section3')}`,
  `${t('home.faq.accordion6.step2.section1')} <strong>${t('home.faq.accordion6.step2.section2')}</strong> ${t('home.faq.or')} <strong>${t('home.faq.accordion6.step2.section3')}</strong>${t('home.faq.fullstop')}`,
  `${t('home.faq.accordion6.step3.section1')} <a href="https://helixapp.com/spot" class="faq-link" target="_blank">${t('home.faq.accordion6.step3.section2')}</a> ${t('home.faq.or')} <a href="https://helixapp.com/futures" class="faq-link" target="_blank">${t('home.faq.accordion6.step3.section3')}</a> ${t('home.faq.accordion6.step3.section4')}`,
  `${t('home.faq.accordion6.step4.section1')} <strong>${t('home.faq.accordion6.step4.section2')}</strong> ${t('home.faq.or')} <strong>${t('home.faq.accordion6.step4.section3')}</strong> ${t('home.faq.accordion6.step4.section4')}`
]

const earnRewardsOptions = [
  `<strong>${t('home.faq.accordion7.option1.section1')}</strong>: ${t('home.faq.accordion7.option1.section2')}`,
  `<strong>${t('home.faq.accordion7.option2.section1')}</strong>: ${t('home.faq.accordion7.option2.section2')}`,
  `<strong>${t('home.faq.accordion7.option3.section1')}</strong>: ${t('home.faq.accordion7.option3.section2')}`,
  `<strong>${t('home.faq.accordion7.option4.section1')}</strong>: ${t('home.faq.accordion7.option4.section2')} <a href="https://helixapp.com/lp-rewards" class="faq-link" target="_blank">${t('home.faq.accordion7.option4.section3')}</a> ${t('home.faq.accordion7.option4.section4')}`
]
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
          <i18n-t
            tag="p"
            keypath="home.faq.accordion1.content1"
            class="leading-tight"
          >
            <template #btc>
              <a
                class="faq-link"
                target="_blank"
                href="https://helixapp.com/futures/btc-usdt-perp"
              >
                {{ $t('home.faq.accordion1.btc') }}
              </a>
            </template>

            <template #eth>
              <a
                class="faq-link"
                target="_blank"
                href="https://helixapp.com/futures/eth-usdt-perp"
              >
                {{ $t('home.faq.accordion1.eth') }}
              </a>
            </template>

            <template #inj>
              <a
                class="faq-link"
                target="_blank"
                href="https://helixapp.com/futures/inj-usdt-perp"
              >
                {{ $t('home.faq.accordion1.inj') }}
              </a>
            </template>
          </i18n-t>

          <br />

          <p class="leading-tight">
            {{ $t('home.faq.accordion1.content2') }}
          </p>

          <br />

          <p class="leading-tight">
            {{ $t('home.faq.accordion1.content3') }}
          </p>
        </div>
      </template>

      <template #accordion-2>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion2.featureTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li
              v-for="(feature, index) in helixFeatures"
              :key="index"
              v-html="feature"
            />
          </ul>
        </div>
      </template>

      <template #accordion-3>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion3.content1') }}
          </p>

          <br />

          <i18n-t
            tag="p"
            keypath="home.faq.accordion3.content2"
            class="leading-tight"
          >
            <template #here>
              <a
                class="faq-link"
                target="_blank"
                href="https://docs.helixapp.com/getting-started"
              >
                {{ $t('home.faq.here') }}
              </a>
            </template>
          </i18n-t>
        </div>
      </template>

      <template #accordion-5>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion5.optionTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li
              v-for="(option, index) in getAssetsOptions"
              :key="index"
              v-html="option"
            />
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
            <li
              v-for="(option, index) in tradeSteps"
              :key="index"
              v-html="option"
            />
          </ol>

          <br />

          <i18n-t
            tag="p"
            keypath="home.faq.accordion6.cta"
            class="leading-tight"
          >
            <template #tutorial>
              <a
                class="faq-link"
                target="_blank"
                href="https://www.youtube.com/watch?v=uEhCbu8L2o0"
              >
                {{ $t('home.faq.accordion6.videoTutorialHere') }}</a
              >
            </template>
          </i18n-t>
        </div>
      </template>

      <template #accordion-7>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion7.optionTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li
              v-for="(option, index) in earnRewardsOptions"
              :key="index"
              v-html="option"
            />
          </ul>
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

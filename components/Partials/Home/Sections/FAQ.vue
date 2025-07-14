<script setup lang="ts">
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
        <div>
          <i18n-t
            tag="p"
            keypath="home.faq.accordion1.content1"
            class="leading-tight"
          >
            <template #btc>
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/futures/btc-usdt-perp"
              >
                {{ $t('home.faq.accordion1.btc') }}
              </NuxtLink>
            </template>

            <template #eth>
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/futures/eth-usdt-perp"
              >
                {{ $t('home.faq.accordion1.eth') }}
              </NuxtLink>
            </template>

            <template #inj>
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/futures/inj-usdt-perp"
              >
                {{ $t('home.faq.accordion1.inj') }}
              </NuxtLink>
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
            <li>
              {{ $t('home.faq.accordion2.feature1.section1') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/spot"
              >
                {{ $t('home.faq.accordion2.feature1.section2') }} </NuxtLink
              >{{ $t('home.faq.fullstop') }}
            </li>

            <li>
              {{ $t('home.faq.accordion2.feature2.section1') }}
              <strong>{{ $t('home.faq.accordion2.feature2.section2') }}</strong>
              {{ $t('home.faq.on') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/futures"
                >{{ $t('home.faq.accordion2.feature2.section3') }}</NuxtLink
              >, {{ $t('home.faq.accordion2.feature2.section4') }},
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/futures/stocks"
                >{{ $t('home.faq.accordion2.feature2.section5') }}</NuxtLink
              >, {{ $t('home.faq.and') }}
              <strong>{{ $t('home.faq.accordion2.feature2.section6') }}</strong>
              {{ $t('home.faq.accordion2.feature2.section7') }}
            </li>

            <li>
              {{ $t('home.faq.accordion2.feature3.section1') }}
              <strong>{{ $t('home.faq.accordion2.feature3.section2') }}</strong>
              {{ $t('home.faq.accordion2.feature3.section3') }}
            </li>

            <li>
              {{ $t('home.faq.accordion2.feature4.section1') }}
              <strong>{{ $t('home.faq.accordion2.feature4.section2') }}</strong
              >,
              <strong>{{ $t('home.faq.accordion2.feature4.section3') }}</strong
              >, {{ $t('home.faq.and') }}
              <strong>{{ $t('home.faq.accordion2.feature4.section4') }}</strong>
              {{ $t('home.faq.accordion2.feature4.section5') }}
            </li>

            <li>
              {{ $t('home.faq.accordion2.feature5.section1') }}
              <strong>{{ $t('home.faq.accordion2.feature5.section2') }}</strong>
              {{ $t('home.faq.accordion2.feature5.section3') }}
            </li>

            <li>
              {{ $t('home.faq.accordion2.feature6.section1') }}
              <strong>{{ $t('home.faq.accordion2.feature6.section2') }}</strong>
              {{ $t('home.faq.accordion2.feature6.section3') }}
            </li>
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
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://docs.helixapp.com/getting-started"
              >
                {{ $t('home.faq.here') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </div>
      </template>

      <template #accordion-4>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion4.optionTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li>
              {{ $t('home.faq.accordion4.option1.section1') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://bridge.injective.network/fiat"
              >
                {{ $t('home.faq.accordion4.option1.section2') }}
              </NuxtLink>
              {{ $t('home.faq.accordion4.option1.section3') }}
            </li>
            <li>
              {{ $t('home.faq.accordion4.option2.section1') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://bridge.injective.network"
              >
                {{ $t('home.faq.accordion4.option2.section2') }}
              </NuxtLink>
              {{ $t('home.faq.accordion4.option2.section3') }}
            </li>
            <li>{{ $t('home.faq.accordion4.option3') }}</li>
          </ul>
        </div>
      </template>

      <template #accordion-5>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion5.stepTitle') }}
          </p>

          <br />

          <ol class="faq-steps-list">
            <li>
              {{ $t('home.faq.accordion5.step1.section1') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/"
              >
                {{ $t('home.faq.accordion5.step1.section2') }}
              </NuxtLink>
              {{ $t('home.faq.accordion5.step1.section3') }}
            </li>
            <li>
              {{ $t('home.faq.accordion5.step2.section1') }}
              <strong>{{ $t('home.faq.accordion5.step2.section2') }}</strong>
              {{ $t('home.faq.or') }}
              <strong>{{ $t('home.faq.accordion5.step2.section3') }}</strong
              >{{ $t('home.faq.fullstop') }}
            </li>
            <li>
              {{ $t('home.faq.accordion5.step3.section1') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/spot"
              >
                {{ $t('home.faq.accordion5.step3.section2') }}
              </NuxtLink>
              {{ $t('home.faq.or') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/futures"
                >{{ $t('home.faq.accordion5.step3.section3') }}
              </NuxtLink>
              {{ $t('home.faq.accordion5.step3.section4') }}
            </li>
            <li>
              {{ $t('home.faq.accordion5.step4.section1') }}
              <strong>{{ $t('home.faq.accordion5.step4.section2') }}</strong>
              {{ $t('home.faq.or') }}
              <strong>{{ $t('home.faq.accordion5.step4.section3') }}</strong>
              {{ $t('home.faq.accordion5.step4.section4') }}
            </li>
          </ol>

          <br />

          <i18n-t
            tag="p"
            keypath="home.faq.accordion5.cta"
            class="leading-tight"
          >
            <template #tutorial>
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://www.youtube.com/watch?v=uEhCbu8L2o0"
              >
                {{ $t('home.faq.accordion5.videoTutorialHere') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </div>
      </template>

      <template #accordion-6>
        <div>
          <p class="leading-tight">
            {{ $t('home.faq.accordion6.optionTitle') }}
          </p>

          <br />

          <ul class="faq-description-list">
            <li>
              <strong>{{ $t('home.faq.accordion6.option1.section1') }} </strong
              >:
              {{ $t('home.faq.accordion6.option1.section2') }}
            </li>
            <li>
              <strong>{{ $t('home.faq.accordion6.option2.section1') }} </strong
              >:
              {{ $t('home.faq.accordion6.option2.section2') }}
            </li>
            <li>
              <strong>{{ $t('home.faq.accordion6.option3.section1') }} </strong
              >:
              {{ $t('home.faq.accordion6.option3.section2') }}
            </li>
            <li>
              <strong>{{ $t('home.faq.accordion6.option4.section1') }} </strong
              >:
              {{ $t('home.faq.accordion6.option4.section2') }}
              <NuxtLink
                target="_blank"
                class="faq-link"
                to="https://helixapp.com/lp-rewards"
              >
                {{ $t('home.faq.accordion6.option4.section3') }}
              </NuxtLink>

              {{ $t('home.faq.accordion6.option4.section4') }}
            </li>
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

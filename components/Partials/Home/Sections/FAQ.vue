<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'

const faqList = [
  {
    label: 'How do I get started with Helix?',
    defaultOpen: true,
    slot: 'accordion-1'
  },
  {
    label: 'Is Identity Verification required?',
    content:
      'No, identity verification is not required on Helix, as it is a decentralized exchange where anyone can freely trade while maintaining full custody of their assets.'
  },
  {
    label: 'What are the trading fees on Helix?',
    content:
      'Trading fees on Helix are designed to be user friendly, with additional benefits like maker rebates, low taker fees, and further discounts tiers available for users who stake INJ.'
  },
  {
    label: 'How do I earn rewards on Helix?',
    content:
      'Helix offers several ways for users to earn by regularly using Helix:'
  },
  {
    label: 'What features are there available on Helix?',
    content:
      'Helix offers a seamless and powerful trading experience with advanced features and flexibility:'
  },
  {
    label: 'What stocks can I trade on Helix?',
    content:
      'Helix offers a wide range of stock perpetual markets that allow users to trade tokenized versions of popular equities with leverage. Some of the major stocks available on Helix include Apple (AAPL), Amazon (AMZN), Tesla (TSLA) and many others.'
  }
]
</script>

<template>
  <div class="relative pt-32 flex flex-col items-center">
    <div id="faq-title" class="mb-6">
      <h1 class="text-2xl lg:text-5xl font-semibold text-center">
        {{ $t('common.faq') }}
      </h1>
    </div>

    <UAccordion
      v-bind="{
        items: faqList,
        color: 'white',
        variant: 'ghost',
        openIcon: NuxtUiIcons.ChevronDownCircle,
        ui: {
          container: 'border-b border-b-[#727376] last:border-b-0',
          default: {
            class: 'text-[22px] px-0 pt-6 pb-4 dark:hover:bg-transparent '
          },
          item: {
            size: 'text-sm',
            icon: '!size-8',
            color: 'text-white',
            padding: 'pt-0 pb-4'
          }
        }
      }"
    >
      <template #accordion-1>
        <div>
          <p>
            To start trading on Helix, simply log in using your social account
            or connect your wallet, then deposit your assets.
          </p>

          <p>
            Follow the complete onboarding guide
            <a
              class="underline hover:text-white/70 transition-colors"
              href="https://docs.helixapp.com/getting-started"
              target="_blank"
              >here</a
            >
            to get set up step-by-step.
          </p>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

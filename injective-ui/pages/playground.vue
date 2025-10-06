<script lang="ts" setup>
definePageMeta({
  middleware: [
    (to) => {
      if (to.query.devMode !== 'true') {
        return navigateTo('/')
      }
    }
  ]
})

const values = reactive({
  amount: '1',
  decimals: 6,
  abbreviateThreshold: 1_000_000,
  subscriptThresholdDecimals: 3,
  subscriptDecimals: 4
})

const testNumbers = [
  '0.0000001',
  '-0.0000001',
  '0.01',
  '0.0110000',
  '1.1',
  '1000',
  '1000000',
  '1000000000.123',
  '1000.000000000123',
  '-1000.000000000123',
  '1000.1234567891',
  '-1000.1234567891',
  '1580000.123',
  '1230000000.123',

  '12',
  '12.34',
  '12.12345',
  '1234.12',
  '1234.12345'
]
</script>

<template>
  <div class="p-5">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <UCard>
        <div>
          <p>Amount:</p>
          <UInput v-model="values.amount" />
        </div>
        <div>
          <p>Decimals:</p>
          <UInput v-model="values.decimals" type="number" />
        </div>
        <div>
          <p>Abbreviate Threshold:</p>
          <UInput v-model="values.abbreviateThreshold" type="number" />
        </div>
        <div>
          <p>Subscript Threshold:</p>
          <UInput v-model="values.subscriptThresholdDecimals" type="number" />
        </div>
        <div>
          <p>Subscript Decimals:</p>
          <UInput v-model="values.subscriptDecimals" type="number" />
        </div>
      </UCard>

      <UCard>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <UButton
            v-for="testNumber in testNumbers"
            :key="testNumber"
            variant="outline"
            @click="values.amount = testNumber"
          >
            <p>{{ testNumber }}</p>
          </UButton>
        </div>
      </UCard>
    </div>

    <UCard class="mt-5">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UCard class="flex flex-col">
          <div class="flex-1 h-full">
            <p class="text-lg font-bold">Usd Amount</p>
          </div>
          <SharedAmountUsd :amount="values.amount">
            <template #prefix>$</template>
          </SharedAmountUsd>
        </UCard>

        <UCard class="flex flex-col">
          <div class="flex-1">
            <p class="text-lg font-bold">Amount</p>
            <p class="text-xs text-gray-500">
              (with no trailing zeros & we dont show decimals if the number is
              bigger than 1M)
            </p>
          </div>
          <div class="mt-2"><SharedAmount :amount="values.amount" /> INJ</div>
        </UCard>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
      <template
        v-for="noTrailingZeros in [false, true]"
        :key="noTrailingZeros.toString()"
      >
        <template
          v-for="useSubscript in [false, true]"
          :key="useSubscript.toString()"
        >
          <UCard>
            <div class="text-xs">
              <p>
                No Trailing Zeros:
                <span
                  class="font-bold"
                  :class="[noTrailingZeros ? 'text-green-500' : 'text-red-500']"
                  >{{ noTrailingZeros }}</span
                >
              </p>
              <p>
                Use Subscript:
                <span
                  class="font-bold"
                  :class="[useSubscript ? 'text-green-500' : 'text-red-500']"
                  >{{ useSubscript }}</span
                >
              </p>

              <p class="text-right border-t pt-2 mt-2">
                <SharedAmountBase
                  class="text-2xl"
                  v-bind="{
                    useSubscript,
                    noTrailingZeros,
                    amount: values.amount,
                    decimals: Number(values.decimals),
                    subscriptDecimals: Number(values.subscriptDecimals),
                    abbreviationThreshold: Number(values.abbreviateThreshold),
                    subscriptThresholdDecimals: Number(
                      values.subscriptThresholdDecimals
                    )
                  }"
                />
              </p>
            </div>
          </UCard>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { OfflineDirectSigner } from '@cosmjs/proto-signing'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/esm/core/stargate'
import { InjectiveDirectEthSecp256k1Wallet } from '@injectivelabs/sdk-ts/dist/esm/core/accounts/signers'

// get wallet
const wallet = await InjectiveDirectEthSecp256k1Wallet.fromKey(
  Buffer.from(
    'f9db9bf330e23cb7839039e944adef6e9df447b90b503d5b4464c90bea9022f3',
    'hex'
  )
)

const client = await InjectiveSigningStargateClient.connectWithSigner(
  'https://testnet.tm.injective.network',
  wallet as OfflineDirectSigner
)

async function send() {
  const amount = {
    denom: 'inj',
    amount: '1000000000'
  }

  await client.sendTokens(
    'inj1hkhdaj2a2clmq5jq6mspsggqs32vynpk228q3r',
    'inj15zztd6zjja4lzckt596vjglc6de77jpqsqvl3h',
    [amount],
    {
      amount: [{ denom: 'inj', amount: '2000' }],
      gas: '2000'
    },
    'Have fun with your coins'
  )

  // //
  // console.log(txResponse)
}
</script>

<template>
  <div>
    <AppButton @click="send">click</AppButton>
  </div>
</template>

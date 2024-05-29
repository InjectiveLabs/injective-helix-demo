import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { HttpClient } from '@injectivelabs/utils'
import { Network, isTestnet, isMainnet } from '@injectivelabs/networks'

const NETWORK: Network = process.env.VITE_NETWORK as Network
const IS_TESTNET: boolean = isTestnet(NETWORK)
const IS_MAINNET: boolean = isMainnet(NETWORK)

export const fetchTokens = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/tokens/'
  )

  const fileName = IS_MAINNET
    ? 'mainnet.json'
    : IS_TESTNET
    ? 'testnet.json'
    : 'devnet.json'

  try {
    const { data: tokens } = (await client.get(fileName)) as any

    writeFileSync('app/data/tokens.json', JSON.stringify(tokens, null, '\t'))

    // eslint-disable-next-line no-console
    console.log('✅✅✅ Tokens fetched successfully!')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

fetchTokens()

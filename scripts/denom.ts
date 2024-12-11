/* eslint-disable no-console */
import 'dotenv/config'
import { HttpClient } from '@injectivelabs/utils'
import { storeJsonFile } from './helper'

export const fetchTokens = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/denoms/'
  )

  try {
    const { data: tokens } = (await client.get(fileName)) as any

    storeJsonFile(`app/json/denoms/${fileName}`, tokens)

    console.log(`✅✅✅ Denoms - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Denoms - ${fileName}`)
    throw err
  }
}

fetchTokens('devnet.json')
fetchTokens('testnet.json')
fetchTokens('mainnet.json')

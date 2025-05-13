import 'dotenv/config'
import { storeJsonFile } from './helper'
import { HttpClient } from '@injectivelabs/utils'

export const fetchTokens = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/tokens/verified/'
  )

  try {
    const { data: tokens } = (await client.get(fileName)) as any

    storeJsonFile(`app/json/tokens/${fileName}`, tokens)

    console.log(`✅✅✅ Tokens - ${fileName}`)
  } catch (err) {
    console.error(`❌❌❌ Tokens - ${fileName}`)
    throw err
  }
}

fetchTokens('devnet.json')
fetchTokens('testnet.json')
fetchTokens('mainnet.json')

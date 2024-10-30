/* eslint-disable no-console */
import 'dotenv/config'
import { HttpClient } from '@injectivelabs/utils'
import { storeJsonFile } from './helper'

export const fetchSwapRoutes = async (fileName: string): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/swap/'
  )

  try {
    const { data: routes } = (await client.get(fileName)) as {
      data: any
    }

    storeJsonFile(`app/json/swap/${fileName}`, routes)

    console.log(`✅✅✅ Swap ${fileName} Routes`)
  } catch (err) {
    console.log(`❌❌❌ Swap ${fileName} Routes`)
    throw err
  }
}

fetchSwapRoutes('mainnet.json')
fetchSwapRoutes('testnet.json')
fetchSwapRoutes('devnet.json')

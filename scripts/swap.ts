/* eslint-disable no-console */
import 'dotenv/config'
import { HttpClient } from '@injectivelabs/utils'
import { storeJsonFile } from './helper'

export const fetchSwapRoutes = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/helix/trading/swap/'
  )

  try {
    const { data: routes } = (await client.get('routes.json')) as {
      data: any
    }

    storeJsonFile('app/json/swap-routes.json', routes)

    console.log('✅✅✅ Swap Routes')
  } catch (err) {
    console.log('❌❌❌ Swap Routes')
    throw err
  }
}

fetchSwapRoutes()

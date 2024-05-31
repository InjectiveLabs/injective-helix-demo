import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { HttpClient } from '@injectivelabs/utils'

export const fetchOFACWalletAddresses = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/wallets'
  )

  const fileName = 'ofac.json'

  try {
    const { data: wallets } = (await client.get(fileName)) as any

    writeFileSync('app/data/ofac.json', JSON.stringify(wallets, null, '\t'))

    // eslint-disable-next-line no-console
    console.log('✅✅✅ OFAC Wallets fetched successfully!')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
  }
}

fetchOFACWalletAddresses()

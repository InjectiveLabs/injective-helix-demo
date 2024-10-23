/* eslint-disable no-console */
import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { HttpClient } from '@injectivelabs/utils'

export const fetchOFACWalletAddresses = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/wallets'
  )

  const fileName = 'ofac.json'

  try {
    const { data: wallets } = (await client.get(fileName)) as any

    writeFileSync(
      'app/json/blacklistedAddresses.json',
      JSON.stringify(wallets, null, '\t')
    )

    console.log('✅✅✅ OFAC blacklisted addresses!')
  } catch (err) {
    console.error('❌❌❌ OFAC blacklisted addresses')
    throw err
  }
}

export const fetchRestrictedCountries = async (): Promise<any> => {
  const client = new HttpClient(
    'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/master/json/geo'
  )

  const fileName = 'countries.json'

  try {
    const { data: countries } = (await client.get(fileName)) as any

    writeFileSync(
      'app/json/restrictedCountries.json',
      JSON.stringify(countries, null, '\t')
    )

    console.log('✅✅✅ Restricted countries!')
  } catch (err) {
    console.error('❌❌❌ Restricted countries')
    throw err
  }
}

fetchRestrictedCountries()
fetchOFACWalletAddresses()

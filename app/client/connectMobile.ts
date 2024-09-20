import { HttpClient } from '@injectivelabs/utils'

export const CONNECT_SERVER_URL = 'http://10.0.1.60:3005'
// const CONNECT_SERVER_URL = 'https://api.express.injective.dev/'

export const client = new HttpClient(CONNECT_SERVER_URL)

export async function addDesktopAddress({
  desktopAddress
}: {
  desktopAddress: string
}) {
  return await client.post<
    {
      desktopAddress: string
    },
    { message: string }
  >('helix-connect/desktop', {
    desktopAddress
  })
}

export async function getMobileAddress({
  desktopAddress
}: {
  desktopAddress: string
}) {
  return await client.get<
    {
      desktopAddress: string
    },
    { mobileAddress: string }
  >(`helix-connect/desktop/${desktopAddress}`)
}

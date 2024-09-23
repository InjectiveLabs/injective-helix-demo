import { HttpClient } from '@injectivelabs/utils'
import { CONNECT_SERVER_URL } from '../utils/constants'

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

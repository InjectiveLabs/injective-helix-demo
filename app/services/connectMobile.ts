import { HttpRequestException } from '@injectivelabs/exceptions'
import { HttpClient } from '@injectivelabs/utils'
import { CONNECT_SERVER_URL } from '../utils/constants'

export const client = new HttpClient(CONNECT_SERVER_URL)

export const addDesktopAddress = async ({
  desktopAddress
}: {
  desktopAddress: string
}) => {
  try {
    return await client.post<
      {
        desktopAddress: string
      },
      { message: string }
    >('helix-connect/desktop', {
      desktopAddress
    })
  } catch (e: unknown) {
    const response = (e as any).response

    throw new HttpRequestException(
      new Error(
        response
          ? response.data.message
          : 'Something happened, please try again later!'
      ),
      { contextModule: 'connectMobile' }
    )
  }
}

export const getMobileAddress = async ({
  desktopAddress
}: {
  desktopAddress: string
}) => {
  try {
    return await client.get<
      {
        desktopAddress: string
      },
      { mobileAddress: string }
    >(`helix-connect/desktop/${desktopAddress}`)
  } catch (e: unknown) {
    const response = (e as any).response

    throw new HttpRequestException(
      new Error(
        response
          ? response.data.message
          : 'Something happened, please try again later!'
      ),
      { contextModule: 'connectMobile' }
    )
  }
}

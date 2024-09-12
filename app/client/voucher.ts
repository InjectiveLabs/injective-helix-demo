import { HttpClient } from '@injectivelabs/utils'

export const client = new HttpClient('https://api.express.injective.dev/')

export async function redeemVoucher({
  address,
  voucherId
}: {
  address: string
  voucherId: string
}) {
  return await client.post<
    {
      address: string
      voucherId: string
    },
    { message: string }
  >('voucher/helix', {
    address,
    voucherId
  })
}

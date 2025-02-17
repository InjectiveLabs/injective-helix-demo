import {
  MsgSignData,
  getEip712TypedDataV2,
  generateArbitrarySignDoc
} from '@injectivelabs/sdk-ts'
import { ETHEREUM_CHAIN_ID } from '@/app/utils/constants'

export const getEip712TypedData = (signer: string, message: string) => {
  const { signDoc } = generateArbitrarySignDoc(message, signer)

  const tx = {
    memo: signDoc.memo,
    accountNumber: signDoc.account_number,
    sequence: signDoc.sequence,
    timeoutHeight: '0',
    chainId: signDoc.chain_id
  }

  const msgs = signDoc.msgs.map((msg) => {
    return MsgSignData.fromJSON({
      sender: msg.value.signer,
      data: Buffer.from(msg.value.data, 'base64').toString('utf-8')
    })
  })

  const eip712TypedData = getEip712TypedDataV2({
    msgs,
    tx,
    ethereumChainId: ETHEREUM_CHAIN_ID
  })

  return eip712TypedData
}

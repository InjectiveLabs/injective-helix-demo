import { gql } from '@apollo/client/core'

export const USER_DEPOSITS = gql`
  query Deposits($sender: Bytes!) {
    deposits(where: { sender: $sender }) {
      id
      tokenContract
      sender
      destination
      amount
      timestamp
      blockHeight
    }
  }
`

export const USER_WITHDRAWALS = gql`
  query Withdrawals($sender: Bytes!) {
    withdrawals(where: { sender: $sender }) {
      id
      tokenContract
      sender
      destination
      amount
      timestamp
      blockHeight
    }
  }
`

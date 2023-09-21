import { GrantAuthorization as BaseGrantAuthorization } from '@injectivelabs/sdk-ts'

export type GrantAuthorization = Omit<
  BaseGrantAuthorization,
  'authorization'
> & {
  authorization: any
}

export enum GrantDirection {
  Grantee = 'grantee',
  Granter = 'granter'
}

export const tokensMetaData: Map<
  string,
  { name: string; symbol: string; decimals: number; icon: string }
> = new Map([
  [
    'inj',
    {
      name: 'Injective',
      symbol: 'INJ',
      decimals: 18,
      icon: '/icons/inj-2.svg',
      denom: 'inj',
      address: '0xa3a9029b8120e2f09b194df4a249a24db461e573'
    }
  ],
  [
    'peggy0xdac17f958d2ee523a2206206994597c13d831ec7',
    {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      denom: 'peggy0xdac17f958d2ee523a2206206994597c13d831ec7',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      icon: '/icons/tusd.svg'
    }
  ]
])

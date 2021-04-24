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
      icon: '/icons/inj-2.svg'
    }
  ],
  [
    'peggy0xdac17f958d2ee523a2206206994597c13d831ec7',
    {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      icon: '/icons/tusd.svg'
    }
  ]
])

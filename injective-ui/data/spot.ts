export const spotMarketIdMap: Record<string, { slug: string; ticker: string }> =
  {
    '0xd0ba680312852ffb0709446fff518e6c4d798fb70cfd2699aba3717a2517cfd5': {
      // APP/INJ
      slug: 'app-usdt',
      ticker: 'APP/USDT'
    },
    '0x959c9401a557ac090fff3ec11db5a1a9832e51a97a41b722d2496bb3cb0b2f72': {
      // ANDR/INJ
      slug: 'andr-usdt',
      ticker: 'ANDR/USDT'
    },
    '0xa6ec1de114a5ffa85b6b235144383ce51028a1c0c2dee7db5ff8bf14d5ca0d49': {
      slug: 'pythlegacy-usdt',
      ticker: 'PYTHlegacy/USDT'
    },
    '0x75f6a79b552dac417df219ab384be19cb13b53dec7cf512d73a965aee8bc83af': {
      slug: 'usdyet-usdt',
      ticker: 'USDYet/USDT'
    }
  }

export const spotDenomMap: Record<string, Function> = {
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1tjcf9497fwmrnk22jfu5hsdq82qshga54ajvzy':
    ({ slug, ticker }: { slug: string; ticker: string }) => ({
      slug: slug.replace('pyth', 'pythlegacy'),
      ticker: ticker.replace('PYTH', 'PYTHlegacy')
    }),
  peggy0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48: ({
    slug,
    ticker
  }: {
    slug: string
    ticker: string
  }) => ({
    slug: slug.replace('usdc', 'usdclegacy'),
    ticker: ticker.replace('USDC', 'USDClegacy')
  }),
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1q6zlut7gtkzknkk773jecujwsdkgq882akqksk':
    ({ slug, ticker }: { slug: string; ticker: string }) => ({
      slug: slug.replace('usdc', 'usdcet'),
      ticker: ticker.replace('USDC', 'USDCet')
    }),
  'ibc/2CBC2EA121AE42563B08028466F37B600F2D7D4282342DE938283CC3FB2BC00E': ({
    slug,
    ticker
  }: {
    slug: string
    ticker: string
  }) => ({
    slug: slug.replace('usdcnb', 'usdc'),
    ticker: ticker.replace('USDCnb', 'USDC')
  }),
  'factory/inj1alwxgkns9x7d2sprymwwfvzl5t7teetym02lrj/NONJA': ({
    slug,
    ticker
  }: {
    slug: string
    ticker: string
  }) => ({
    slug: slug.replace('nonja', 'nonjaunverified'),
    ticker: ticker.replace('NONJA', 'NONJAunverified')
  }),
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1sthrn5ep8ls5vzz8f9gp89khhmedahhdkqa8z3':
    ({ slug, ticker }: { slug: string; ticker: string }) => ({
      slug: slug.replace('sol', 'sollegacy'),
      ticker: ticker.replace('SOL', 'SOLlegacy')
    }),
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1d5vz0uzwlpfvgwrwulxg6syy82axa58y4fuszd':
    ({ slug, ticker }: { slug: string; ticker: string }) => ({
      slug: slug.replace('arb', 'arblegacy'),
      ticker: ticker.replace('ARB', 'ARBlegacy')
    }),
  'factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1dxv423h8ygzgxmxnvrf33ws3k94aedfdevxd8h':
    ({ slug, ticker }: { slug: string; ticker: string }) => ({
      slug: slug.replace('wmatic', 'wmaticlegacy'),
      ticker: ticker.replace('WMATIC', 'WMATIClegacy')
    })
}

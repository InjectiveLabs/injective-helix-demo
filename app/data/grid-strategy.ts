import { IS_DEVNET, IS_STAGING, IS_TESTNET } from '@/app/utils/constants/setup'
import { SpotGridMarket, SpotGridMessages } from '@/types'

export const gridStrategyAuthorizationMessageTypes = [
  SpotGridMessages.MsgWithdraw,
  SpotGridMessages.MsgBatchUpdateOrders,
  SpotGridMessages.MsgCreateSpotMarketOrder
]

const mainnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj1x4kr29dlf9u4r7ya6mr2jvs0pc9sfhnlhlr9np'
  },
  {
    slug: 'atom-usdt',
    contractAddress: 'inj1c5jsz3dk2g6wywygchwrlwxl5gyz2yu7rnxxdr'
  },
  {
    slug: 'tia-usdt',
    contractAddress: 'inj1ljzjh8tzuvrj7mkhv9mxvv4cedn7kzauargrey'
  },
  {
    slug: 'stinj-inj',
    contractAddress: 'inj195l0hketpha2x2zahckfhlchlkrwckxd74030v'
  },
  {
    slug: 'weth-usdt',
    contractAddress: 'inj1vldp2685n8gwynpxfnmv6ucn5qumjsnqkkmhm5'
  },
  {
    slug: 'whale-usdt',
    contractAddress: 'inj1fuftrqrfmuh0xrg50jlgnq4ptarq5dd9f6k450'
  },
  {
    slug: 'usdtkv-usdt',
    contractAddress: 'inj1ej7je29ugdqg3ynrza2w30gf5r5rch37rhz53h'
  },
  {
    slug: 'wmatic-usdt',
    contractAddress: 'inj1zlufv9jjugee9ejm5grqdk4ja09e7vv6ewv0yx'
  },
  {
    slug: 'arb-usdt',
    contractAddress: 'inj18srw6ktk67sez2m2k20hgsftp8gj5xmzz8a6u7'
  },
  {
    slug: 'kuji-usdt',
    contractAddress: 'inj1zen7yh00gffkvsxcptqzaslu27msrw0ee933vf'
  },
  {
    slug: 'talis-usdt',
    contractAddress: 'inj144w02j59yh5jwf6ufe6pf3uasckw7cca833r6r'
  },
  {
    slug: 'sol-usdt',
    contractAddress: 'inj1a2xr74g9w78acf054jfwspzmgzy5flv5275642'
  }
]

if (IS_STAGING) {
  mainnetSpotGridMarkets.push(
    ...[
      {
        slug: 'pyth-usdt',
        contractAddress: 'inj1t8g6vuj3hyu6r9lrdmgttvzm9wqxztr0uhfgls'
      }
    ]
  )
}

const testnetSpotGridMarkets: SpotGridMarket[] = [
  // {
  //   slug: 'inj-usdt',
  //   contractAddress: 'inj1djlhetddzrztjn4v0s4vt0dca3y8hwshkh37zg'
  // },
  // {
  //   slug: 'atom-usdt',
  //   contractAddress: 'inj14yr8nj6tndmr4xyw9c66feqepv59revxsm7450'
  // },
  // {
  //   slug: 'atom-usdt',
  //   contractAddress: 'inj1qzc20al6khfy5ta3m4fk0atct5k98tnny0t7he'
  // },
  // {
  //   slug: 'tia-usdt',
  //   contractAddress: 'inj18sl3ysva0czdgc2eqmqlrhfeu2v4l8vx4245ql'
  // }
  {
    slug: 'inj-usdt',
    contractAddress: 'inj1fs4mr4qsqwwsh4tps860tcvx2kfunfkwv5p750'
  },
  {
    slug: 'atom-usdt',
    contractAddress: 'inj107fsasqmcqs4ztmvxdhrxsekzyjxcz7xwafjw5'
  },
  {
    slug: 'tia-usdt',
    contractAddress: 'inj1zvjssysvcqwpsyr6rqr658vy9qp9dp2halezd3'
  }

  // Add This Market Later
  // {
  //   slug: 'weth-usdt',
  //   contractAddress: 'inj1aehu642q3td95jlpprgcypmstmn3pknaq4rsjn'
  // }
]

const devnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj14hj2tavq8fpesdwxxcu44rty3hh90vhujaxlnz'
  }
]

export const spotGridMarkets: SpotGridMarket[] = IS_TESTNET
  ? testnetSpotGridMarkets
  : IS_DEVNET
  ? devnetSpotGridMarkets
  : mainnetSpotGridMarkets

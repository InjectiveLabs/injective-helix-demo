import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants/setup'
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
    slug: 'weth-usdt',
    contractAddress: 'inj1vldp2685n8gwynpxfnmv6ucn5qumjsnqkkmhm5'
  },
  {
    slug: 'pyth-usdt',
    contractAddress: 'inj1t8g6vuj3hyu6r9lrdmgttvzm9wqxztr0uhfgls'
  },
  {
    slug: 'usdtkv-usdt',
    contractAddress: 'inj1ej7je29ugdqg3ynrza2w30gf5r5rch37rhz53h'
  },
  {
    slug: 'usdt-usdcet',
    contractAddress: 'inj18njxtxdcv49aalx4dhtzew7d5kug52m09vn87t'
  }
  // {
  //   slug: 'stinj-inj',
  //   contractAddress: 'inj195l0hketpha2x2zahckfhlchlkrwckxd74030v'
  // }
]

const testnetSpotGridMarkets: SpotGridMarket[] = [
  {
    slug: 'inj-usdt',
    contractAddress: 'inj1djlhetddzrztjn4v0s4vt0dca3y8hwshkh37zg'
  },
  // OLD ATOM CONTRACT
  // {
  //   slug: 'atom-usdt',
  //   contractAddress: 'inj14yr8nj6tndmr4xyw9c66feqepv59revxsm7450'
  // },
  {
    slug: 'atom-usdt',
    contractAddress: 'inj1qzc20al6khfy5ta3m4fk0atct5k98tnny0t7he'
  },
  {
    slug: 'tia-usdt',
    contractAddress: 'inj18sl3ysva0czdgc2eqmqlrhfeu2v4l8vx4245ql'
  }

  // Add This Market Later
  // {
  //   slug: 'weth-usdt',
  //   contractAddress: 'inj1aehu642q3td95jlpprgcypmstmn3pknaq4rsjn'
  // }
]

export const spotGridMarkets: SpotGridMarket[] =
  IS_TESTNET || IS_DEVNET ? testnetSpotGridMarkets : mainnetSpotGridMarkets

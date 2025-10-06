import { IS_DEVNET, IS_TESTNET } from '../utils/constant'
import {
  CosmosChainIds,
  Network,
  type CosmosChannel,
  type CosmosChannelData
} from '../types'

export const CosmosChainId = {
  [Network.Axelar]: 'axelar-dojo-1',
  [Network.Celestia]: 'celestia',
  [Network.CosmosHub]: 'cosmoshub-4',
  [Network.Crescent]: 'crescent-1',
  [Network.Evmos]: 'evmos_9001-2',
  [Network.Injective]: 'injective-1',
  [Network.Kava]: 'kava_2222-10',
  [Network.Kujira]: 'kaiyo-1',
  [Network.Migaloo]: 'migaloo-1',
  [Network.Noble]: 'noble-1',
  [Network.Oraichain]: 'Oraichain',
  [Network.Osmosis]: 'osmosis-1',
  [Network.Persistence]: 'core-1',
  [Network.Secret]: 'secret-4',
  [Network.Sommelier]: 'sommelier-3',
  [Network.Stride]: 'stride-1',
  [Network.CosmosHubTestnet]: 'theta-testnet-001',
  [Network.Andromeda]: 'andromeda-1',
  [Network.Saga]: 'ssc-1',
  [Network.Fetch]: 'fetchhub-4',
  [Network.XionTestnet]: 'xion-testnet-1',
  [Network.EvmosTestnet]: 'evmos_9000-4',
  [Network.Mantra]: 'mantra-1',
  [Network.WormholeGeneric]: 'wormchain',
  [Network.Neutron]: 'neutron-1',
  [Network.Xion]: 'xion-mainnet-1',

  // networks below are disabled
  [Network.Canto]: 'canto_7700-1',
  [Network.Chihuahua]: 'chihuahua-1',
  [Network.Juno]: 'juno-1',
  [Network.Terra]: 'columbus-5',
  [Network.InjectiveDevnet]: 'injective-777',
  [Network.InjectiveTestnet]: 'injective-888',
  [Network.XRPL]: '14400001'
}

export const cosmoMainnetChannel: Record<string, CosmosChannel> = {
  [Network.CosmosHub]: {
    aChainId: CosmosChainId[Network.CosmosHub],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-220',
    aToBClientId: '07-tendermint-470',
    bToAChannelId: 'channel-1',
    bToAClientId: '07-tendermint-5',
    port: 'transfer'
  },
  [Network.Osmosis]: {
    aChainId: CosmosChainId[Network.Osmosis],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-122',
    aToBClientId: '07-tendermint-1703',
    bToAChannelId: 'channel-8',
    bToAClientId: '07-tendermint-19',
    port: 'transfer'
  },
  [Network.Axelar]: {
    aChainId: CosmosChainId[Network.Axelar],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-10',
    aToBClientId: '07-tendermint-37',
    bToAChannelId: 'channel-84',
    bToAClientId: '07-tendermint-113',
    port: 'transfer'
  },
  [Network.Evmos]: {
    aChainId: CosmosChainId[Network.Evmos],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-10',
    aToBClientId: '07-tendermint-19',
    bToAChannelId: 'channel-83',
    bToAClientId: '07-tendermint-112',
    port: 'transfer'
  },
  [Network.Persistence]: {
    aChainId: CosmosChainId[Network.Persistence],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-41',
    aToBClientId: '07-tendermint-57',
    bToAChannelId: 'channel-82',
    bToAClientId: '07-tendermint-110',
    port: 'transfer'
  },
  [Network.Secret]: {
    aChainId: CosmosChainId[Network.Secret],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-23',
    aToBClientId: '07-tendermint-22',
    bToAChannelId: 'channel-88',
    bToAClientId: '07-tendermint-97',
    port: 'transfer'
  },
  [Network.Stride]: {
    aChainId: CosmosChainId[Network.Stride],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-6',
    aToBClientId: '07-tendermint-2',
    bToAChannelId: 'channel-89',
    bToAClientId: '07-tendermint-131',
    port: 'transfer'
  },
  [Network.Crescent]: {
    aChainId: CosmosChainId[Network.Crescent],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-23',
    aToBClientId: '',
    bToAChannelId: 'channel-90',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Sommelier]: {
    aChainId: CosmosChainId[Network.Sommelier],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-1',
    aToBClientId: '',
    bToAChannelId: 'channel-93',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Kava]: {
    aChainId: CosmosChainId[Network.Kava],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-122',
    aToBClientId: '',
    bToAChannelId: 'channel-143',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Oraichain]: {
    aChainId: CosmosChainId[Network.Oraichain],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-146',
    aToBClientId: '',
    bToAChannelId: 'channel-147',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Celestia]: {
    aChainId: CosmosChainId[Network.Celestia],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-7',
    aToBClientId: '',
    bToAChannelId: 'channel-152',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Migaloo]: {
    aChainId: CosmosChainId[Network.Migaloo],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-3',
    aToBClientId: '',
    bToAChannelId: 'channel-102',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Kujira]: {
    aChainId: CosmosChainId[Network.Kujira],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-54',
    aToBClientId: '',
    bToAChannelId: 'channel-98',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Andromeda]: {
    aChainId: CosmosChainId[Network.Andromeda],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-13',
    aToBClientId: '',
    bToAChannelId: 'channel-213',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Noble]: {
    aChainId: CosmosChainId[Network.Noble],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-31',
    aToBClientId: '',
    bToAChannelId: 'channel-148',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Saga]: {
    aChainId: CosmosChainId[Network.Saga],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-25',
    aToBClientId: '',
    bToAChannelId: 'channel-261',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Fetch]: {
    aChainId: CosmosChainId[Network.Fetch],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-33',
    aToBClientId: '07-tendermint-82',
    bToAChannelId: 'channel-283',
    bToAClientId: '07-tendermint-266',
    port: 'transfer'
  },
  [Network.Mantra]: {
    aChainId: CosmosChainId[Network.Mantra],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-2',
    aToBClientId: '07-tendermint-2',
    bToAChannelId: 'channel-363',
    bToAClientId: '07-tendermint-275',
    port: 'transfer'
  },
  [Network.Xion]: {
    aChainId: CosmosChainId[Network.Xion],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-4',
    aToBClientId: '07-tendermint-4',
    bToAChannelId: 'channel-387',
    bToAClientId: '07-tendermint-279',
    port: 'transfer'
  },
  [Network.XRPL]: {
    aChainId: CosmosChainId[Network.XRPL],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-0',
    aToBClientId: '07-tendermint-0',
    bToAChannelId: 'channel-436',
    bToAClientId: '07-tendermint-314',
    port: 'transfer'
  }
  // networks below are disabled
  // [Network.Noble]: {
  //   aChainId: CosmosChainId[Network.Noble],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-31',
  //   aToBClientId: '07-tendermint-57',
  //   bToAChannelId: 'channel-148',
  //   bToAClientId: '07-tendermint-212',
  //   port: 'transfer'
  // },
  // [Network.Canto]: {
  //   aChainId: CosmosChainId[Network.Canto],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-8',
  //   aToBClientId: '',
  //   bToAChannelId: 'channel-99',
  //   bToAClientId: '',
  //   port: 'transfer'
  // },
  // [Network.Chihuahua]: {
  //   aChainId: CosmosChainId[Network.Chihuahua],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-12',
  //   aToBClientId: '07-tendermint-55',
  //   bToAChannelId: 'channel-76',
  //   bToAClientId: '07-tendermint-99',
  //   port: 'transfer'
  // },
  // [Network.Juno]: {
  //   aChainId: CosmosChainId[Network.Juno],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-59',
  //   aToBClientId: '07-tendermint-83',
  //   bToAChannelId: 'channel-87',
  //   bToAClientId: '07-tendermint-101',
  //   port: 'transfer'
  // }
}

export const cosmosTestnetChannels: Record<string, CosmosChannel> = {
  [Network.CosmosHubTestnet]: {
    aChainId: CosmosChainId[Network.CosmosHubTestnet],
    bChainId: 'injective-888',
    aToBChannelId: 'channel-86',
    aToBClientId: '07-tendermint-107',
    bToAChannelId: 'channel-1',
    bToAClientId: '07-tendermint-1',
    port: 'transfer'
  },
  [Network.XionTestnet]: {
    aChainId: CosmosChainId[Network.XionTestnet],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-487',
    aToBClientId: '',
    bToAChannelId: 'channel-489',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.EvmosTestnet]: {
    aChainId: CosmosChainId[Network.EvmosTestnet],
    bChainId: 'injective-888',
    aToBClientId: '',
    aToBChannelId: 'channel-243',
    bToAClientId: '',
    bToAChannelId: 'channel-76996',
    port: 'transfer'
  }
}

export const cosmosChannels = IS_DEVNET
  ? {}
  : IS_TESTNET
    ? cosmosTestnetChannels
    : cosmoMainnetChannel

export const IBC_COIN_CHANNEL_IDS = Object.values(cosmosChannels).map(
  (cosmosChannel: CosmosChannel) => cosmosChannel.bToAChannelId
)

export const GATEWAY_CHANNEL_ID = 'channel-183'

export const COSMOS_CHANNEL_MAP: Partial<
  Record<CosmosChainIds, Partial<Record<CosmosChainIds, CosmosChannelData>>>
> = {
  [CosmosChainIds.Axelar]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-10',
      clientId: '07-tendermint-37',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Celestia]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-7',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.CosmosHub]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-220',
      clientId: '07-tendermint-470',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Crescent]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-23',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Evmos]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-10',
      clientId: '07-tendermint-19',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Injective]: {
    [CosmosChainIds.CosmosHub]: {
      channel: 'channel-1',
      clientId: '07-tendermint-5',
      port: 'transfer'
    },
    [CosmosChainIds.Osmosis]: {
      channel: 'channel-8',
      clientId: '07-tendermint-19',
      port: 'transfer'
    },
    [CosmosChainIds.Axelar]: {
      channel: 'channel-84',
      clientId: '07-tendermint-113',
      port: 'transfer'
    },
    [CosmosChainIds.Evmos]: {
      channel: 'channel-83',
      clientId: '07-tendermint-112',
      port: 'transfer'
    },
    [CosmosChainIds.Persistence]: {
      channel: 'channel-82',
      clientId: '07-tendermint-110',
      port: 'transfer'
    },
    [CosmosChainIds.Secret]: {
      channel: 'channel-88',
      clientId: '07-tendermint-97',
      port: 'transfer'
    },
    [CosmosChainIds.Stride]: {
      channel: 'channel-89',
      clientId: '07-tendermint-131',
      port: 'transfer'
    },
    [CosmosChainIds.Crescent]: {
      channel: 'channel-90',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Sommelier]: {
      channel: 'channel-93',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Kava]: {
      channel: 'channel-143',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Oraichain]: {
      channel: 'channel-147',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Celestia]: {
      channel: 'channel-152',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Migaloo]: {
      channel: 'channel-102',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Kujira]: {
      channel: 'channel-98',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Andromeda]: {
      channel: 'channel-213',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Noble]: {
      channel: 'channel-148',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Saga]: {
      channel: 'channel-261',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.Fetch]: {
      channel: 'channel-283',
      clientId: '07-tendermint-266',
      port: 'transfer'
    },
    [CosmosChainIds.Mantra]: {
      channel: 'channel-363',
      clientId: '07-tendermint-275',
      port: 'transfer'
    },
    [CosmosChainIds.Xion]: {
      channel: 'channel-387',
      clientId: '07-tendermint-279',
      port: 'transfer'
    },
    [CosmosChainIds.XRPL]: {
      channel: 'channel-436',
      clientId: '07-tendermint-314',
      port: 'transfer'
    },
    [CosmosChainIds.CosmosHubTestnet]: {
      channel: 'channel-1',
      clientId: '07-tendermint-1',
      port: 'transfer'
    },
    [CosmosChainIds.XionTestnet]: {
      channel: 'channel-489',
      clientId: '',
      port: 'transfer'
    },
    [CosmosChainIds.EvmosTestnet]: {
      channel: 'channel-76996',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Kava]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-122',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Kujira]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-54',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Migaloo]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-3',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Noble]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-31',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Oraichain]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-146',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Osmosis]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-122',
      clientId: '07-tendermint-1703',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Persistence]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-41',
      clientId: '07-tendermint-57',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Secret]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-23',
      clientId: '07-tendermint-22',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Sommelier]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-1',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Stride]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-6',
      clientId: '07-tendermint-2',
      port: 'transfer'
    }
  },
  [CosmosChainIds.CosmosHubTestnet]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-86',
      clientId: '07-tendermint-107',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Andromeda]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-13',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Saga]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-25',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Fetch]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-33',
      clientId: '07-tendermint-82',
      port: 'transfer'
    }
  },
  [CosmosChainIds.XionTestnet]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-487',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.EvmosTestnet]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-243',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Mantra]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-2',
      clientId: '07-tendermint-2',
      port: 'transfer'
    }
  },
  [CosmosChainIds.WormholeGeneric]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-0',
      clientId: '07-tendermint-0',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Neutron]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-0',
      clientId: '07-tendermint-0',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Xion]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-4',
      clientId: '07-tendermint-4',
      port: 'transfer'
    }
  },
  [CosmosChainIds.XRPL]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-0',
      clientId: '07-tendermint-0',
      port: 'transfer'
    }
  },
  // Disabled networks
  [CosmosChainIds.Canto]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-8',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Chihuahua]: {},
  [CosmosChainIds.Juno]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-59',
      clientId: '07-tendermint-83',
      port: 'transfer'
    }
  },
  [CosmosChainIds.Terra]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-12',
      clientId: '07-tendermint-55',
      port: 'transfer'
    }
  },
  [CosmosChainIds.InjectiveDevnet]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-777',
      clientId: '',
      port: 'transfer'
    }
  },
  [CosmosChainIds.InjectiveTestnet]: {
    [CosmosChainIds.Injective]: {
      channel: 'channel-888',
      clientId: '',
      port: 'transfer'
    }
  }
}

export function getCosmosChannel(from: string, to: string) {
  return COSMOS_CHANNEL_MAP[from as CosmosChainIds]?.[to as CosmosChainIds]
}

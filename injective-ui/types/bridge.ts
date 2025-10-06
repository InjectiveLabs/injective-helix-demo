export enum Network {
  Axelar = 'axelar',
  Canto = 'canto',
  Chihuahua = 'chihuahua',
  CosmosHub = 'cosmosHub',
  Ethereum = 'ethereum',
  EthereumWh = 'ethereumWh',
  Evmos = 'evmos',
  Fetch = 'fetch',
  Injective = 'injective',
  Juno = 'juno',
  Osmosis = 'osmosis',
  Persistence = 'Persistence',
  Terra = 'terra',
  Secret = 'secret',
  Stride = 'stride',
  Crescent = 'crescent',
  Solana = 'solana',
  Sommelier = 'sommelier',
  Arbitrum = 'arbitrum',
  Polygon = 'polygon',
  Klaytn = 'klaytn',
  Sui = 'sui',
  Kava = 'kava',
  Oraichain = 'oraichain',
  Noble = 'noble',
  Celestia = 'celestia',
  Migaloo = 'migaloo',
  Kujira = 'kujira',
  CosmosHubTestnet = 'cosmosHub-testnet',
  Andromeda = 'andromeda',
  Saga = 'saga',
  Mantra = 'mantra',
  Neutron = 'neutron',
  Wormhole = 'wormhole',
  WormholeGeneric = 'wormhole-generic',
  XionTestnet = 'xion-testnet',
  Xion = 'xion',
  XRPL = 'xrpl',
  EvmosTestnet = 'evmos-testnet',
  InjectiveDevnet = 'injective-devnet',
  InjectiveTestnet = 'injective-testnet'
}

export enum CosmosChainIds {
  Axelar = 'axelar-dojo-1',
  Celestia = 'celestia',
  CosmosHub = 'cosmoshub-4',
  Crescent = 'crescent-1',
  Evmos = 'evmos_9001-2',
  Injective = 'injective-1',
  Kava = 'kava_2222-10',
  Kujira = 'kaiyo-1',
  Migaloo = 'migaloo-1',
  Noble = 'noble-1',
  Oraichain = 'Oraichain',
  Osmosis = 'osmosis-1',
  Persistence = 'core-1',
  Secret = 'secret-4',
  Sommelier = 'sommelier-3',
  Stride = 'stride-1',
  CosmosHubTestnet = 'theta-testnet-001',
  Andromeda = 'andromeda-1',
  Saga = 'ssc-1',
  Fetch = 'fetchhub-4',
  XionTestnet = 'xion-testnet-1',
  EvmosTestnet = 'evmos_9000-4',
  Mantra = 'mantra-1',
  WormholeGeneric = 'wormchain',
  Neutron = 'neutron-1',
  Xion = 'xion-mainnet-1',

  // networks below are disabled
  Canto = 'canto_7700-1',
  Chihuahua = 'chihuahua-1',
  Juno = 'juno-1',
  Terra = 'columbus-5',
  InjectiveDevnet = 'injective-777',
  InjectiveTestnet = 'injective-888',
  XRPL = '14400001'
}

export type CosmosChannelData = {
  channel: string
  clientId: string
  port: string
}

export type CosmosChannel = {
  port: string
  aChainId: string
  bChainId: string
  aToBClientId: string
  bToAClientId: string
  aToBChannelId: string
  bToAChannelId: string
}

export enum ContractMsgType {
  Swap = 'swap'
}

export enum DevnetWasmContractAddress {
  HelixSwap = 'inj1qk00h5atutpsv900x202pxx42npjr9thrzhgxn'
}

export enum TestnetWasmContractAddress {
  HelixSwap = 'inj14d7h5j6ddq6pqppl65z24w7xrtmpcrqjxj8d43'
}

export enum MainnetWasmContractAddress {
  HelixSwap = 'inj12yj3mtjarujkhcp6lg3klxjjfrx2v7v8yswgp9',
  MitoSwap = 'inj1j5mr2hmv7y2z7trazganj75u8km8jvdfuxncsp'
}

export enum EventMessageType {
  CancelSpotOrder = 'cancelSpotOrder',
  BatchCancelSpotOrders = 'batchCancelSpotOrders',
  CancelDerivativeOrder = 'cancelDerivativeOrder',
  BatchCancelDerivativeOrders = 'batchCancelDerivativeOrders'
}

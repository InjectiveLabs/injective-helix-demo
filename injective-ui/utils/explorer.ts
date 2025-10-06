import {
  ContractMsgType,
  DevnetWasmContractAddress,
  MainnetWasmContractAddress,
  TestnetWasmContractAddress
} from '../types/enum'
import { IS_MAINNET, IS_TESTNET } from '../utils/constant'

export const MainnetContractCopyMap = {
  [MainnetWasmContractAddress.HelixSwap]: 'Helix Swap',
  [MainnetWasmContractAddress.MitoSwap]: 'Mito Swap'
}

export const TestnetContractCopyMap = {
  [TestnetWasmContractAddress.HelixSwap]: 'Helix Swap'
}

export const DevnetContractCopyMap = {
  [DevnetWasmContractAddress.HelixSwap]: 'Mito Swap'
}

const getHardCodedContracts = () => {
  if (IS_MAINNET) {
    return Object.values(MainnetWasmContractAddress) as string[]
  }

  if (IS_TESTNET) {
    return Object.values(TestnetWasmContractAddress) as string[]
  }

  return Object.values(DevnetWasmContractAddress) as string[]
}

const getHardCodedContractCopyMap = (): Record<string, string> => {
  if (IS_MAINNET) {
    return MainnetContractCopyMap
  }

  if (IS_TESTNET) {
    return TestnetContractCopyMap
  }

  return DevnetContractCopyMap
}

const getContractEventMap = (): Record<string, ContractMsgType> => {
  if (IS_MAINNET) {
    return {
      [MainnetWasmContractAddress.HelixSwap]: ContractMsgType.Swap,
      [MainnetWasmContractAddress.MitoSwap]: ContractMsgType.Swap
    }
  }

  if (IS_TESTNET) {
    return {
      [TestnetWasmContractAddress.HelixSwap]: ContractMsgType.Swap
    }
  }

  return {
    [DevnetWasmContractAddress.HelixSwap]: ContractMsgType.Swap
  }
}

export const contractMsgTypeMap = getContractEventMap()
export const hardCodedContracts = getHardCodedContracts()
export const hardCodedContractCopyMap = getHardCodedContractCopyMap()

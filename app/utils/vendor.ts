import { Options } from 'canvas-confetti'
export const AMPLITUDE_WALLET = 'wallet'
export const AMPLITUDE_LOGIN_COUNT = 'login-count'
export const AMPLITUDE_VIP_TIER_LEVEL = 'VIP Tier'
export const AMPLITUDE_PLACE_ORDER_ATTEMPT_COUNT = 'Click Place Order Count'
export const AMPLITUDE_PLACE_ORDER_CONFIRM_COUNT = 'Attempt Place Order Count'
export const AMPLITUDE_TRANSFERS_MADE_COUNT = 'Transfers Made Count'
export const AMPLITUDE_ERROR = 'Error'
export const AMPLITUDE_SUCCESS = 'Success'
export const AMPLITUDE_SUCCESSFUL_SWAP_COUNT = 'swaps-count'
export const AMPLITUDE_CREATE_STRATEGY_COUNT = 'create-strategy'
export const AMPLITUDE_REMOVE_STRATEGY_COUNT = 'remove-strategy'
export const AMPLITUDE_CREATE_LIQUIDITY_COUNT = 'create-liquidityy'
export const AMPLITUDE_REMOVE_LIQUIDITY_COUNT = 'remove-liquidity'

export const confettiOptions = {
  angle: 90,
  spread: 90,
  decay: 0.9,
  ticks: 800,
  gravity: 0.6,
  particleCount: 70,
  shapes: ['square', 'triangle'],
  origin: {
    y: 0
  }
} as Options

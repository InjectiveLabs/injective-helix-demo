
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function square(t: number): number {
  return Math.pow(t, 2)
}

export function flip (t: number): number {
  return 1 - t
}

function easeIn(t: number): number {
  return t * t
}

function easeOut(t: number) {
  return flip(square(flip(t)))
}

function easeInOut(t: number): number {
  return lerp(easeIn(t), easeOut(t), t)
}

function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3

  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

export const Easings = {
  easeIn,
  easeOut,
  easeInOut,
  easeOutElastic
}

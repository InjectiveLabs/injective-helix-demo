export function stringToHex(str: string) {
  let hex = ''

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    const hexCode = charCode.toString(16)
    hex += hexCode.padStart(2, '0')
  }

  return hex
}

export function hexToString(hex: string) {
  let str = ''

  for (let i = 0; i < hex.length; i += 2) {
    const hexCode = hex.slice(i, i + 2)
    const charCode = parseInt(hexCode, 16)
    const char = String.fromCharCode(charCode)
    str += char
  }

  return str
}

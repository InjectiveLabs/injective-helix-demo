const ethers = require('ethers')

/**
 * Get the revert reason from just a transaction hash
 * @param {string} txHash - Hash of an Ethereum transaction
 * @param {string} network - Ethereum network name
 * @param {number} blockNumber - A block number to make the call from
 * @param {*} customProvider - Custom provider (Only ethers and web3 providers are supported at this time)
 */

async function getRevertReason(txHash, appRpcUrl) {
  validateInputPreProvider(txHash)
  const provider = getProvider(appRpcUrl)

  try {
    const tx = await provider.getTransaction(txHash)
    const code = await getCode(tx, provider)
    return decodeMessage(code)
  } catch (err) {
    throw new Error('Unable to decode revert reason.')
  }
}

function validateInputPreProvider(txHash) {
  // Only accept a valid txHash
  if (
    !/^0x([A-Fa-f0-9]{64})$/.test(txHash) ||
    txHash.substring(0, 2) !== '0x'
  ) {
    throw new Error('Invalid transaction hash')
  }
}

function getProvider(appRpcUrl) {
  return new ethers.providers.JsonRpcProvider(appRpcUrl)
}

function decodeMessage(code) {
  let codeString = `0x${code.substr(138)}`.replace(/0+$/, '')

  if (codeString.length % 2 === 1) {
    codeString += '0'
  }

  return ethers.utils.toUtf8String(codeString)
}

async function getCode(tx, provider) {
  const blockNumber = 'latest'

  try {
    return await provider.call(tx, blockNumber)
  } catch (err) {
    return JSON.parse(err.body).error.data
  }
}

module.exports = getRevertReason

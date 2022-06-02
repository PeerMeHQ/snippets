import path from 'path'
import { Network } from './types'
import { getConfig } from './config'
import { readFileSync, writeFileSync } from 'fs'
import { UserSigner } from '@elrondnetwork/erdjs-walletcore'
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers'
import { TransactionFactory, GasEstimator, Account } from '@elrondnetwork/erdjs'

export const getArg = (index: number) => process.argv.slice(2)[index]

export const setup = async (network: Network) => {
  const config = getConfig(network)
  const provider = new ApiNetworkProvider(config.ApiUrl, { timeout: 10000 })
  const networkConfig = await provider.getNetworkConfig()

  const gasEstimator = new GasEstimator()
  const txFactory = new TransactionFactory(gasEstimator)

  return {
    config,
    provider,
    networkConfig,
    txFactory,
  }
}

export const loadSigner = async (provider: ApiNetworkProvider, pemName: string) => {
  const pemWalletPath = path.join(__dirname, '..', '..', 'wallets', pemName)
  const pemWalletContents = readFileSync(pemWalletPath, { encoding: 'utf8' })
  const signer = UserSigner.fromPem(pemWalletContents)
  const account = new Account(signer.getAddress())

  account.update(await provider.getAccount(account.address))

  return {
    signer,
    account,
  }
}

export const loadJsonData = (filename: string) => {
  const inputPath = path.join(__dirname, '..', '..', 'data', filename)
  const inputContents = readFileSync(inputPath, { encoding: 'utf8' })
  return JSON.parse(inputContents)
}

export const saveJsonData = (filename: string, data: any) => {
  const output = path.join(__dirname, '..', '..', 'data', filename)
  const jsoned = JSON.stringify(data)
  writeFileSync(output, jsoned, { encoding: 'utf8' })
}

export const timeout = async (milliseconds: number, log = true) => {
  if (log) {
    console.log(`waiting for ${milliseconds / 1000} seconds...`)
  }

  await new Promise(r => setTimeout(r, milliseconds))
}

export const printSeparator = () => console.log('--------------------------------------------------')

export const getTodayDateFileNameSegment = () => {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()

  return yyyy + '-' + mm + '-' + dd
}

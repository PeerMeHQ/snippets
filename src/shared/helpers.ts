import path from 'path'
import { Network } from './types'
import { getConfig } from './config'
import { readFileSync, writeFileSync } from 'fs'
import { UserSigner } from '@elrondnetwork/erdjs-walletcore'
import { ApiNetworkProvider } from '@elrondnetwork/erdjs-network-providers'
import {
  Account,
  Address,
  TypedValue,
  GasEstimator,
  ResultsParser,
  SmartContract,
  ContractFunction,
  TransactionFactory,
} from '@elrondnetwork/erdjs'

export const getArg = (index: number) => process.argv.slice(2)[index]

export const setup = async (network: Network) => {
  const config = getConfig(network)
  const provider = new ApiNetworkProvider(config.ApiUrl, { timeout: 10000 })
  const networkConfig = await provider.getNetworkConfig()

  const gasEstimator = new GasEstimator()
  const txFactory = new TransactionFactory(gasEstimator)

  const querySc = async (address: string, func: string, args: TypedValue[]) => {
    const contract = new SmartContract({ address: new Address(address) })
    const query = contract.createQuery({
      func: new ContractFunction(func),
      args,
      caller: new Address(address),
    })
    const response = await provider.queryContract(query)
    return new ResultsParser().parseUntypedQueryResponse(response).values
  }

  return {
    config,
    provider,
    networkConfig,
    txFactory,
    querySc,
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

export const trimHash = (hash: string, keep = 10) => {
  const start = hash.substring(0, keep)
  const end = hash.substring(hash.length - keep)
  return `${start}...${end}`
}

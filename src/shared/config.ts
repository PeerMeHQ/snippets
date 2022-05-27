import { Network } from './types'

type Config = {
  ApiUrl: string
}

const MainnetConfig: Config = {
  ApiUrl: 'https://api.elrond.com',
}

const TestnetConfig: Config = {
  ApiUrl: 'https://testnet-api.elrond.com',
}

const DevnetConfig: Config = {
  ApiUrl: 'https://devnet-api.elrond.com',
}

export const getConfig = (network: Network) => {
  if (network === 'mainnet') return MainnetConfig
  if (network === 'testnet') return TestnetConfig
  return DevnetConfig
}

import { Network } from './types'

type Config = {
  ApiUrl: string
}

const MainnetConfig: Config = {
  ApiUrl: 'https://api.multiversx.com',
}

const TestnetConfig: Config = {
  ApiUrl: 'https://testnet-api.multiversx.com',
}

const DevnetConfig: Config = {
  ApiUrl: 'https://devnet-api.multiversx.com',
}

export const getConfig = (network: Network) => {
  if (network === 'mainnet') return MainnetConfig
  if (network === 'testnet') return TestnetConfig
  return DevnetConfig
}

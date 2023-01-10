import { Network, TokenAccount } from './shared/types'
import { getArg, getTodayDateFileNameSegment, saveJsonData, setup } from './shared/helpers'

// ts-node src/snapshot-esdt-accounts.ts

const Network: Network = 'devnet'

// param 1: token id
const main = async () => {
  const tokenId = getArg(0)
  const { provider } = await setup(Network)

  const accounts: TokenAccount[] = await provider.doGetGeneric(`tokens/${tokenId}/accounts?size=10000`)
  const fileName = `snapshot_${getTodayDateFileNameSegment()}_${tokenId}.json`

  saveJsonData(fileName, accounts)

  console.log(`saved ${accounts.length} to ${fileName}!`)
}

main()

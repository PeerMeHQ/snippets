import collect from 'collect.js'
import { Network, TokenAccount } from './shared/types'
import { getArg, getTodayDateFileNameSegment, saveJsonData, setup } from './shared/helpers'

// ts-node src/snapshot-esdt-accounts.ts

const Network: Network = 'devnet'

// param 1: token id
const main = async () => {
  const tokenId = getArg(0)
  const { provider } = await setup(Network)

  const accounts: TokenAccount[] = await provider.doGetGeneric(`tokens/${tokenId}/accounts?size=10000`)
  const fileName = `snapshot_esdt_${getTodayDateFileNameSegment()}_${tokenId}.json`

  const formatted = collect(accounts)
    .map(account => account.address)
    .unique()
    .all()

  saveJsonData(fileName, formatted)

  console.log('✅', `Saved ${accounts.length} to ${fileName}!`)
}

main()

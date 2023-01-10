import collect from 'collect.js'
import { Network, TokenAccount } from './shared/types'
import { getArg, getTodayDateFileNameSegment, saveJsonData, setup } from './shared/helpers'

// ts-node src/snapshot-collection-accounts.ts

const Network: Network = 'mainnet'

// param 1: collection id
const main = async () => {
  const collectionId = getArg(0)
  const { provider } = await setup(Network)

  const accounts: TokenAccount[] = await provider.doGetGeneric(`collections/${collectionId}/accounts?size=10000`)
  const fileName = `snapshot_collection_${getTodayDateFileNameSegment()}_${collectionId}.json`

  const formatted = collect(accounts)
    .map(account => account.address)
    .unique()
    .all()

  saveJsonData(fileName, formatted)

  console.log('✅', `Saved ${accounts.length} to ${fileName}!`)
}

main()

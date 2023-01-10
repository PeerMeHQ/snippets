import collect from 'collect.js'
import BigNumber from 'bignumber.js'
import { Network, TokenAccount } from './shared/types'
import { getArg, getTodayDateFileNameSegment, saveJsonData, setup } from './shared/helpers'

// ts-node src/snapshot-esdt-accounts.ts

const Network: Network = 'devnet'

// arg 1: token id
// arg 2 (optional): minimum balance
const main = async () => {
  const tokenId = getArg(0)
  const minBalance = getArg(1)
  const { provider } = await setup(Network)

  const tokenInfo = await provider.getDefinitionOfFungibleToken(tokenId)
  const fileName = `snapshot_esdt_${getTodayDateFileNameSegment()}_${tokenId}.json`

  let accounts: TokenAccount[] = await provider.doGetGeneric(`tokens/${tokenId}/accounts?size=10000`)

  if (minBalance) {
    accounts = accounts.filter(info => new BigNumber(minBalance).shiftedBy(tokenInfo.decimals).lte(info.balance))
  }

  const formatted = collect(accounts)
    .map(account => account.address)
    .unique()
    .all()

  saveJsonData(fileName, formatted)

  console.log('✅', `Saved ${accounts.length} to ${fileName}!`)
}

main()

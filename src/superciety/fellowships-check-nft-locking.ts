import { Network } from '../shared/types'
import { printSeparator, setup, timeout } from '../shared/helpers'
import { Address, TokenIdentifierValue } from '@elrondnetwork/erdjs'

// ts-node src/superciety/fellowships-check-nft-locking.ts

/*
 * WARNING: Dirty Script
 */

const Network: Network = 'devnet'
const ManagerScAddress = ''

const main = async () => {
  const { config, provider, networkConfig, querySc } = await setup(Network)

  const contracts = (await querySc(ManagerScAddress, 'getEntities', [])).map(buffer => Address.fromBuffer(buffer).bech32())

  printSeparator()
  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  printSeparator()

  let invalid = 0

  for (const contract of contracts) {
    const govTokenIdEncoded = await querySc(contract, 'getGovTokenId', [])
    const govTokenId = Buffer.from(govTokenIdEncoded[0]).toString('utf-8')

    if (!govTokenId) {
      continue
    }

    try {
      const isLockingVoteTokensEncoded = await querySc(contract, 'isLockingVoteTokens', [new TokenIdentifierValue(govTokenId)])
      const isLockingVoteTokens =
        Buffer.isBuffer(isLockingVoteTokensEncoded[0]) && isLockingVoteTokensEncoded[0].length > 0
          ? Boolean((isLockingVoteTokensEncoded[0] as any).readInt8())
          : false

      if (!isLockingVoteTokens) {
        continue
      }
    } catch (err) {
      console.log('failed to check isLockingVoteTokens', contract, err)
      continue
    }

    try {
      const nft = await provider.getDefinitionOfTokenCollection(govTokenId)

      if (nft.type === 'NonFungibleESDT') {
        invalid++
        console.log('⚠️', nft.collection, 'is a NFT collection but IS locking vote tokens! Consider upgrading: ', contract)
      }
    } catch (error) {
      continue
    }

    await timeout(5_000, false)
  }

  console.log('✅', 'done checks', `(${invalid} contracts should be locked)`)
}

main()

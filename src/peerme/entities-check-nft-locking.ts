import { Network } from '../shared/types'
import { printSeparator, setup, timeout } from '../shared/helpers'
import { Address, TokenIdentifierValue } from '@multiversx/sdk-core'

// ts-node src/peerme/entities-check-nft-locking.ts

const Network: Network = 'mainnet'
const ManagerScAddress = 'erd1qqqqqqqqqqqqqpgqtatmxjhlxkehl37u5kz9tz7sm450xd7f27rsppynzj'

const main = async () => {
  const { config, provider, querySc } = await setup(Network)

  const contracts = (await querySc(ManagerScAddress, 'getEntities', [])).map(buffer => Address.fromBuffer(buffer).bech32())

  printSeparator()
  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  printSeparator()

  let invalid = 0

  for (const contract of contracts) {
    const govTokenIdEncoded = await querySc(contract, 'getGovTokenId', [])
    const govTokenId = Buffer.from(govTokenIdEncoded[0]).toString('utf-8')

    if (!govTokenId) {
      console.log('_', contract, 'is multisig')
      continue
    }

    const isLockingVoteTokensEncoded = await querySc(contract, 'isLockingVoteTokens', [new TokenIdentifierValue(govTokenId)])
    const isLockingVoteTokens =
      Buffer.isBuffer(isLockingVoteTokensEncoded[0]) && isLockingVoteTokensEncoded[0].length > 0
        ? Boolean((isLockingVoteTokensEncoded[0] as any).readInt8())
        : false

    try {
      const nft = await provider.getDefinitionOfTokenCollection(govTokenId)

      if (nft.type === 'NonFungibleESDT') {
        if (isLockingVoteTokens) {
          invalid++
          console.log('❌', nft.collection, 'is a NFT collection but IS locking vote tokens!', contract)
        } else {
          console.log('✅', nft.collection, 'is a NFT collection and is NOT locking vote tokens', contract)
        }
      } else if (nft.type === 'SemiFungibleESDT') {
        if (!isLockingVoteTokens) {
          invalid++
          console.log('️❌', nft.collection, 'is SFT collection but is NOT locking vote tokens!', contract)
        } else {
          console.log('✅', nft.collection, 'is SFT collection and IS locking vote tokens', contract)
        }
      } else {
        console.log('🚨', 'unknown type', nft.type, govTokenId, contract)
      }
    } catch (e) {
      console.log('_', govTokenId, 'is not a NFT/SFT', contract)
    }

    await timeout(1_000, false)
  }

  console.log('✅', 'done checks', `(${invalid} should be optimized)`)
}

main()

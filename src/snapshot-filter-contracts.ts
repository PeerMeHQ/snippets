import collect from 'collect.js'
import { getArg, loadJsonData, saveJsonData } from './shared/helpers'
import { Address } from '@multiversx/sdk-core/out'

// ts-node src/snapshot-filter-contracts.ts

// arg 1: input file
// arg 2: output file
const main = async () => {
  const inputFile = getArg(0)
  const outputFile = getArg(1)

  const contents = await (<Promise<string[]>>loadJsonData(inputFile))

  const filtered = collect(contents)
    .reject((address) => Address.fromBech32(address).isContractAddress())
    .all()

  saveJsonData(outputFile, filtered)

  console.log('🗑️', `Filtered ${contents.length - filtered.length} smart contract addresses.`)
  console.log('✅', `Saved ${filtered.length} items to ${outputFile}!`)
}

main()

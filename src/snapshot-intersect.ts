import collect from 'collect.js'
import { getArg, loadJsonData, saveJsonData } from './shared/helpers'

// ts-node src/snapshot-intersect.ts

// arg 1: first input
// arg 2: second input
// arg 3: output file
const main = async () => {
  const inputA = getArg(0)
  const inputB = getArg(1)
  const outputFile = getArg(2)

  const contentsA = await loadJsonData(inputA)
  const contentsB = await loadJsonData(inputB)

  const intersection = collect(contentsA)
    .intersect(contentsB)
    .unique()
    .all()

  saveJsonData(outputFile, intersection)

  console.log('✅', `Saved ${intersection.length} items to ${outputFile}!`)
}

main()

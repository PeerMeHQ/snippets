import fs from 'fs'
import path from 'path'
import collect from 'collect.js'
import { getArg, loadJsonData, saveJsonData } from './shared/helpers'

// ts-node src/snapshot-merger.ts

// arg 1: input directory
// arg 1: output file
const main = async () => {
  const inputDir = getArg(0)
  const outputFile = getArg(1)

  const inputDirPath = path.join(__dirname, '..', 'data', inputDir)
  const mergables = await fs.promises.readdir(inputDirPath, { encoding: 'utf8' })
  let merged: string[] = []

  for (let file of mergables) {
    const snapshot = await loadJsonData(`/${inputDir}/${file}`)
    merged = merged.concat(snapshot)
  }

  const sanitized = collect(merged)
    .unique()
    .all()

  saveJsonData(outputFile, sanitized)

  console.log('✅', `Saved ${sanitized.length} items to ${outputFile}!`)
}

main()

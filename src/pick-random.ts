import collect from 'collect.js'
import { Network } from './shared/types'
import { getArg, loadJsonData, saveJsonData } from './shared/helpers'

const Network: Network = 'devnet'
const Input = 'snapshot.json'
const Output = 'random.json'

// params: amount
const main = async () => {
  const amount = +getArg(0)

  console.log(`picking ${amount} random addresses...`)

  const randomlyPickedAddresses = collect(<string[]>loadJsonData(Input))
    .unique()
    .shuffle()
    .take(amount)
    .all()

  saveJsonData(Output, randomlyPickedAddresses)

  console.log('done!')
}

main()

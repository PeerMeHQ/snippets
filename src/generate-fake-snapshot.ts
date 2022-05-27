import { Network } from './shared/types'
import { getArg, saveJsonData } from './shared/helpers'
import { Mnemonic } from '@elrondnetwork/erdjs-walletcore/out'

const Network: Network = 'devnet'
const Output = 'snapshot.json'

// params: amount
const main = async () => {
  const amount = +getArg(0)

  console.log(`generating ${amount} fake addresses...`)

  const generatePubKey = () =>
    Mnemonic.generate()
      .deriveKey(0)
      .generatePublicKey()

  const randomAddresses = Array.from({ length: amount })
    .map(generatePubKey)
    .map(key => key.toAddress().bech32())

  saveJsonData(Output, randomAddresses)

  console.log('done!')
}

main()

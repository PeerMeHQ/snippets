import { getArg, saveJsonData } from './shared/helpers'
import { Mnemonic } from '@multiversx/sdk-core-walletcore/out'

// ts-node src/generate-fake-snapshot.ts {amount}

const Output = 'snapshot.json'

const main = async () => {
  const amount = +getArg(0)

  console.log(`generating ${amount} fake addresses...`)

  const generatePubKey = () => Mnemonic.generate().deriveKey(0).generatePublicKey()

  const randomAddresses = Array.from({ length: amount })
    .map(generatePubKey)
    .map((key) => key.toAddress().bech32())

  saveJsonData(Output, randomAddresses)

  console.log('done!')
}

main()

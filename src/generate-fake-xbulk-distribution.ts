import { getArg } from './shared/helpers'
import { Mnemonic } from '@multiversx/sdk-core-walletcore/out'

// ts-node src/generate-fake-xbulk-distribution.ts {amount} {minValue} {maxValue}

const main = async () => {
  const amount = +getArg(0)
  const minValue = +getArg(1)
  const maxValue = +getArg(2)

  console.log(`generating fake distribution with ${amount} lines...`)

  const generatePubKey = () => Mnemonic.generate().deriveKey(0).generatePublicKey()

  const generateRandomValue = () => {
    const randomValue = Math.random() * (maxValue - minValue) + minValue
    return parseFloat(randomValue.toFixed(2))
  }

  const randomAddresses = Array.from({ length: amount })
    .map(generatePubKey)
    .map((key) => key.toAddress().bech32() + ',' + generateRandomValue().toString())
    .join('\n')

  console.log(randomAddresses)
}

main()

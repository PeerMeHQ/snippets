import collect from 'collect.js'
import { Network } from './shared/types'
import { Address, TokenPayment } from '@elrondnetwork/erdjs'
import { getArg, loadJsonData, loadSigner, printSeparator, setup, timeout } from './shared/helpers'

const Network: Network = 'devnet'
const SignerWallet = 'distributor.pem'
const Input = 'participants.json'

// param 1: amount
const main = async () => {
  const amount = getArg(0)
  const { config, provider, networkConfig, txFactory } = await setup(Network)
  const { signer, account } = await loadSigner(provider, SignerWallet)
  const receivers = collect(<string[]>loadJsonData(Input))
    .unique()
    .all()

  const payment = TokenPayment.egldFromAmount(amount)

  printSeparator()
  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  console.log('Sender: ' + account.address + ` (Nonce: ${account.nonce.valueOf()})`)
  console.log('Amount: ' + payment.toPrettyString())
  console.log('Amount (Total): ' + +amount * receivers.length)
  console.log('Receivers: ' + receivers.length)
  printSeparator()

  await timeout(10_000)

  for (const receiver of receivers) {
    const tx = txFactory.createEGLDTransfer({
      nonce: account.getNonceThenIncrement(),
      sender: account.address,
      receiver: new Address(receiver),
      value: payment.toString(),
      chainID: networkConfig.ChainID,
    })

    await signer.sign(tx)
    await provider.sendTransaction(tx)

    console.log(`sent ${payment.toPrettyString()} to ${receiver}`)
    await timeout(250, false)
  }

  console.log('done!')
}

main()

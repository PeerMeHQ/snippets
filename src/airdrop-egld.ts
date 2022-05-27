import { Network } from './shared/types'
import { Address, TokenPayment } from '@elrondnetwork/erdjs'
import { getArg, loadJsonData, loadSigner, setup, timeout } from './shared/helpers'

const Network: Network = 'devnet'
const SignerWallet = 'defi-wallet.pem'
const Input = 'snapshot.json'

// params: amount
const main = async () => {
  const amount = getArg(0)
  const { config, provider, networkConfig, txFactory } = await setup(Network)
  const { signer, account } = await loadSigner(provider, SignerWallet)
  const receivers = <string[]>loadJsonData(Input)

  const payment = TokenPayment.egldFromAmount(amount)

  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  console.log('Sender: ' + account.address + ` (Nonce: ${account.nonce.valueOf()})`)
  console.log('Amount: ' + payment.toPrettyString())
  console.log('Receivers: ' + receivers.length)

  await timeout(2_000)

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

    console.log(`sent ${payment.toRationalNumber()} to ${receiver} (hash: ${tx.getHash()})`)
    await timeout(200, false)
  }

  console.log('done!')
}

main()

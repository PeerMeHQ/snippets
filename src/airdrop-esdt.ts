import collect from 'collect.js'
import { Network } from './shared/types'
import { Address, TokenPayment } from '@multiversx/sdk-core'
import { getArg, loadJsonData, loadSigner, printSeparator, setup, timeout } from './shared/helpers'

const Network: Network = 'devnet'
const SignerWallet = 'distributor.pem'
const Input = 'participants.json'

// param 1: token id
// param 2: amount
const main = async () => {
  const tokenId = getArg(0)
  const amount = getArg(1)
  const { config, provider, networkConfig, txFactory } = await setup(Network)
  const { signer, account } = await loadSigner(provider, SignerWallet)
  const receivers = collect(<string[]>loadJsonData(Input))
    .unique()
    .all()

  const tokenDefinition = await provider.getDefinitionOfFungibleToken(tokenId)

  const payment = TokenPayment.fungibleFromAmount(tokenId, amount, tokenDefinition.decimals)

  printSeparator()
  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  console.log('Sender: ' + account.address + ` (Nonce: ${account.nonce.valueOf()})`)
  console.log('Amount: ' + payment.toPrettyString())
  console.log('Receivers: ' + receivers.length)
  printSeparator()

  await timeout(10_000)

  for (const receiver of receivers) {
    const tx = txFactory.createESDTTransfer({
      nonce: account.getNonceThenIncrement(),
      sender: account.address,
      receiver: new Address(receiver),
      tokenTransfer: payment,
      chainID: networkConfig.ChainID,
    })

    const serialized = tx.serializeForSigning()
    const signature = await signer.sign(serialized)
    tx.applySignature(signature)

    await provider.sendTransaction(tx)

    console.log(`sent ${payment.toPrettyString()} to ${receiver}`)
    await timeout(200, false)
  }

  console.log('done!')
}

main()

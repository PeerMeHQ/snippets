import collect from 'collect.js'
import BigNumber from 'bignumber.js'
import { Network } from './shared/types'
import { Address, TokenPayment } from '@elrondnetwork/erdjs'
import { getArg, loadJsonData, loadSigner, printSeparator, setup, timeout } from './shared/helpers'

const Network: Network = 'devnet'
const SignerWallet = 'distributor.pem'
const Input = 'participants.json'

// param 1: token id
// param 2: reserve amount - how many of the tokens to leave in the account
const main = async () => {
  const tokenId = getArg(0)
  const reserveAmount = +getArg(1) || 0
  const { config, provider, networkConfig, txFactory } = await setup(Network)
  const { signer, account } = await loadSigner(provider, SignerWallet)
  const receivers = collect(<string[]>loadJsonData(Input))
    .unique()
    .all()

  const tokenDefinition = await provider.getDefinitionOfFungibleToken(tokenId)
  const tokenAccount = await provider.getFungibleTokenOfAccount(account.address, tokenId)

  const reserveBig = new BigNumber(reserveAmount).shiftedBy(tokenDefinition.decimals)
  const availableAmount = tokenAccount.balance.minus(reserveBig)
  const amountPerIndividual = availableAmount.div(new BigNumber(receivers.length)).toFixed(0)

  const payment = TokenPayment.fungibleFromBigInteger(tokenId, amountPerIndividual, tokenDefinition.decimals)

  printSeparator()
  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  console.log('Sender: ' + account.address + ` (Nonce: ${account.nonce.valueOf()})`)
  console.log('Receivers: ' + receivers.length)
  printSeparator()
  console.log('Reserved: ' + reserveAmount)
  console.log('Each account receives: ' + payment.toPrettyString())
  printSeparator()

  await timeout(10_000)

  for (const receiver of receivers) {
    const tx = txFactory.createESDTTransfer({
      nonce: account.getNonceThenIncrement(),
      sender: account.address,
      receiver: new Address(receiver),
      payment: payment,
      chainID: networkConfig.ChainID,
    })

    await signer.sign(tx)
    await provider.sendTransaction(tx)

    console.log(`sent ${payment.toPrettyString()} to ${receiver}`)
    await timeout(200, false)
  }

  console.log('done!')
}

main()

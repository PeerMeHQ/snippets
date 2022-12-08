import { Network } from '../shared/types'
import { loadSigner, printSeparator, setup, timeout } from '../shared/helpers'
import { Address, AddressValue, ContractFunction, Interaction, SmartContract } from '@elrondnetwork/erdjs'

const Network: Network = 'devnet'
const SignerWallet = 'distributor.pem'
const ManagerScAddress = ''

const main = async () => {
  const { config, provider, networkConfig, querySc } = await setup(Network)
  const { signer, account } = await loadSigner(provider, SignerWallet)

  const contracts = (await querySc(ManagerScAddress, 'getEntities', [])).map(buffer => Address.fromBuffer(buffer).bech32())

  printSeparator()
  console.log('Network: ' + Network.toUpperCase() + ` (Url: ${config.ApiUrl})`)
  console.log(`Upgrading ${contracts.length} contracts ...`)
  printSeparator()

  await timeout(5_000)

  for (const contract of contracts) {
    const sc = new SmartContract({ address: Address.fromBech32(ManagerScAddress) })
    const args = [new AddressValue(Address.fromBech32(contract))]

    const tx = new Interaction(sc, new ContractFunction('upgradeEntity'), args)
      .withChainID(networkConfig.ChainID)
      .withGasLimit(50_000_000)
      .withNonce(account.getNonceThenIncrement())
      .buildTransaction()

    await signer.sign(tx)
    await provider.sendTransaction(tx)

    console.log(`sent upgrade request to ${contract}`)
    await timeout(250, false)
  }

  console.log('done!')
}

main()

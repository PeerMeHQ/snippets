import { Network } from './shared/types'
import { loadSigner, setup } from './shared/helpers'
import { Transaction, TransactionPayload } from '@elrondnetwork/erdjs/out'

const Network: Network = 'devnet'
const SignerWallet = 'test-server.pem'

const main = async () => {
  const { config, provider, networkConfig, txFactory } = await setup(Network)
  const { signer, account } = await loadSigner(provider, SignerWallet)
}

main()

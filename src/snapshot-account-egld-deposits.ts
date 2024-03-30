import { BigNumber } from 'bignumber.js'
import { Network } from './shared/types'
import { EgldDecimals } from './shared/constants'
import { saveRawData, setup, timeout } from './shared/helpers'

// ts-node src/snapshot-account-egld-deposits.ts

const Network: Network = 'mainnet'

const AccountAddress: string = ''

const SnapshotFileName = 'snapshot-account-egld-deposits.csv'

type Tx = {
  hash: string
  sender: string
  value: BigNumber
}

const main = async () => {
  const { provider } = await setup(Network)
  const entries: Tx[] = []
  let hasReachedEnd = false
  let currentPage = 0

  while (!hasReachedEnd) {
    const size = 100
    const from = currentPage * size
    const txs = await provider.doGetGeneric(
      `accounts/${AccountAddress}/transactions?receiver=${AccountAddress}&status=success&from=${from}&size=${size}`
    )

    if (txs.length < size) {
      hasReachedEnd = true
    }

    txs
      .map((tx: any) => ({ ...tx, value: new BigNumber(tx.value) }))
      .filter((tx: any) => tx.receiver === AccountAddress)
      .filter((tx: any) => tx.value.isGreaterThan(0))
      .forEach((tx: any) => {
        entries.push({
          hash: tx.txHash,
          sender: tx.sender,
          value: tx.value,
        })
      })

    console.log(`processed ${txs.length} transactions from page ${currentPage}`)

    currentPage++
    await timeout(1000)
  }

  const data = entries
    .reverse()
    .map((tx) => ({ ...tx, value: tx.value.shiftedBy(-EgldDecimals).decimalPlaces(6).toNumber() }))
    .map((tx) => `${tx.hash},${tx.sender},${tx.value},${+tx.value * 470_000},${+tx.value * 470_000 * 0.2}`)
    .join('\n')

  saveRawData(SnapshotFileName, data)
}

main()

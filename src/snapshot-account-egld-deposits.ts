import { BigNumber } from 'bignumber.js'
import { Network } from './shared/types'
import { setup, timeout } from './shared/helpers'
import { EgldDecimals } from './shared/constants'

// ts-node src/snapshot-account-egld-deposits.ts

const Network: Network = 'mainnet'

const AccountAddress: string = 'erd1t2mnpzg0kstjx0a0gf5v4lv7nkyscl03fysexsd760dy807y3m8skn6su2'

type Address = string

const main = async () => {
  const { provider } = await setup(Network)
  const entries: Record<Address, BigNumber> = {}
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

    txs.forEach((tx: any) => {
      const value = new BigNumber(tx.value)
      const previous = entries[tx.sender] || new BigNumber(0)
      entries[tx.sender] = previous.plus(value)
    })

    console.log(`processed ${txs.length} transactions from page ${currentPage}`)

    currentPage++
    await timeout(1000)
  }

  const output = Object.entries(entries)
    .map(([address, value]) => [address, value.shiftedBy(-EgldDecimals).decimalPlaces(6).toNumber()])
    .map(([address, value]) => `${address},${value}`)
    .join('\n')

  console.log(output)
}

main()
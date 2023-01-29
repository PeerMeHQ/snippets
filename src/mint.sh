CHAIN_ID=1
PROXY=https://gateway.elrond.com
SENDER=erd1jd7gxdrv7qkghmm4afzk9hy6pw4qa5cfwt0nl7tmyhqujktc27rskzqmke

# params:
#   $1 = token id
#   $2 = nonce
#   $3 = quantity
addQuantity() {
    erdpy contract call $SENDER \
        --function="ESDTNFTAddQuantity" \
        --arguments "str:$1" $2 $3 \
        --recall-nonce --gas-limit=10000000 \
        --proxy=$PROXY --chain=$CHAIN_ID \
        --ledger \
        --send --wait-result || return
}

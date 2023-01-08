CHAIN_ID=D
PROXY=https://devnet-gateway.elrond.com
ESDT_SC_ADDRESS=erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u

# paras:
#   $1 = token id
#   $2 = address
wipe() {
    erdpy contract call $ESDT_SC_ADDRESS \
        --function="freeze" \
        --arguments "str:$1" $2 \
        --recall-nonce --gas-limit=60000000 \
        --proxy=$PROXY --chain=$CHAIN_ID \
        --ledger \
        --send --wait-result || return

    erdpy contract call $ESDT_SC_ADDRESS \
        --function="wipe" \
        --arguments "str:$1" $2 \
        --recall-nonce --gas-limit=60000000 \
        --proxy=$PROXY --chain=$CHAIN_ID \
        --ledger \
        --send --wait-result || return

    erdpy contract call $ESDT_SC_ADDRESS \
        --function="unFreeze" \
        --arguments "str:$1" $2 \
        --recall-nonce --gas-limit=60000000 \
        --proxy=$PROXY --chain=$CHAIN_ID \
        --ledger \
        --send --wait-result || return
}


# paras:
#   $1 = token id
enableTokenFreezeAndWipe() {
    erdpy --verbose contract call $ESDT_SC_ADDRESS \
        --function="controlChanges" \
        --arguments "str:$1" "str:canFreeze" "str:true" "str:canWipe" "str:true" \
        --recall-nonce --gas-limit=60000000 \
        --proxy=$PROXY --chain=$CHAIN_ID \
        --ledger \
        --send --wait-result || return
}

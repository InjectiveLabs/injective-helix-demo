#!/bin/bash

# USAGE: ./tests_add_orders.sh COSMOS_NODE_BIN

CWD=~/injective/injective-exchange/

# These options can be overridden by env
CHAIN_ID="${CHAIN_ID:-injective-777}"
CHAIN_DIR="${CHAIN_DIR:-$CWD/var/data}"

DENOM="${DENOM:-inj}"

# USDT ERC20 Token by default
TEST_ERC20_DENOM="${TEST_ERC20_DENOM:-peggy0xdAC17F958D2ee523a2206206994597C13D831ec7}"
TEST_ERC20_DECIMALS="${TEST_ERC20_DECIMALS:-000000}"
TEST_ERC20_DENOM_2="${TEST_ERC20_DENOM:-peggy0xdAC17F958D2ee523a2206206994597C13D831ec7}"
TEST_ERC20_DECIMALS_2="${TEST_ERC20_DECIMALS:-000000}"

TEST_DAI_DENOM="peggy0x6b175474e89094c44da98b954eedeac495271d0f"
TEST_USDC_DENOM="peggy0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
TEST_UNI_DENOM="peggy0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
TEST_AAVE_DENOM="peggy0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"
TEST_MATIC_DENOM="peggy0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
TEST_ZRX_DENOM="peggy0xE41d2489571d322189246DaFA5ebDe1F4699F498"
TEST_LINK_DENOM="peggy0x514910771AF9Ca656af840dff83E8264EcF986CA"
TEST_BNB_DENOM="peggy0xB8c77482e45F1F44dE1745F52C74426C631bDD52"
TEST_YFI_DENOM="peggy0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e"
TEST_GF_DENOM="peggy0xAaEf88cEa01475125522e117BFe45cF32044E238"
TEST_WETH_DENOM="peggy0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

TEST_ATOM_IBC_DENOM="ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9"
TEST_LUNA_IBC_DENOM="ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395"
TEST_UST_IBC_DENOM="ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C"

STAKE_DENOM="${STAKE_DENOM:-$DENOM}"
CLEANUP="${CLEANUP:-0}"
LOG_LEVEL="${LOG_LEVEL:-warn}"
SCALE_FACTOR="${SCALE_FACTOR:-000000000000000000}"

NEWLINE=$'\n'

hdir="$CHAIN_DIR/$CHAIN_ID"
NODE_BIN="$1"

# Folders for nodes
n0dir="$hdir/n0"
n1dir="$hdir/n1"
n2dir="$hdir/n2"

# Home flag for folder
home0="--home $n0dir"
home1="--home $n1dir"
home2="--home $n2dir"

# Common flags
kbt="--keyring-backend test"
cid="--chain-id $CHAIN_ID"

function getEthAddress(){
	echo "$($NODE_BIN q exchange eth-address-from-inj-address "$($NODE_BIN $home0 keys show $1 -a $kbt)")000000000000000000000000"
}

function moveFundsForTestUsers(){
	echo "Moving funds for test users"
  	jq -c '.[]' /root/scripts/test_users_funds.json | while read i; do
        name=$(echo $i | jq -c -r ".name")
        description=$(echo $i | jq -c -r ".description")
        command=$(echo $i | jq -c -r ".command")
        from=$($NODE_BIN $home0 keys show $name $kbt -a)
        echo "User: $name | Command: $description"
        $(eval echo "$command") &>/dev/null
        sleep 2
    done
}

function createOrdersForTestUsers(){
	echo "Adding orders for test users"
  	jq -c '.[]' /root/scripts/test_users_orders.json | while read i; do
        name=$(echo $i | jq -c -r ".name")
        description=$(echo $i | jq -c -r ".description")
        command=$(echo $i | jq -c -r ".command")
        sub_account=$(getEthAddress "$name")
        echo "User: $name | Command: $description"
        $(eval echo "$command") &>/dev/null
        sleep 2
    done
}

moveFundsForTestUsers
createOrdersForTestUsers
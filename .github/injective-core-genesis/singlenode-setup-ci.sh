#!/bin/sh

set -e

CWD=/root

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

# Default 3 account keys + 3 user key with no special grants
VAL0_KEY="val"
VAL0_MNEMONIC="remember huge castle bottom apology smooth avocado ceiling tent brief detect poem"
VAL1_KEY="val_1"
VAL1_MNEMONIC="capable dismiss rice income open wage unveil left veteran treat vast brave"
VAL2_KEY="val_2"
VAL2_MNEMONIC="jealous wrist abstract enter erupt hunt victory interest aim defy camp hair"
USER0_KEY="user0"
USER0_MNEMONIC="divide report just assist salad peanut depart song voice decide fringe stumble"
USER1_KEY="user1"
USER1_MNEMONIC="physical page glare junk return scale subject river token door mirror title"
USER2_KEY="user2"
USER2_MNEMONIC="fatigue spray erase sustain record romance dignity mixed rather crystal mix lawn"
USER3_KEY="user3"
USER3_MNEMONIC="assault dance predict atom memory tenant supply victory churn kind addict disorder"
PROPOSER_KEY="proposer"
PROPOSER_MNEMONIC="park curve skill stand dad bronze later affair web cloth wire second"

# Functions related to test users needed by e2e tests
function registerTestUsers() {
	echo "Registersing test users"
    jq -c '.[]' /root/scripts/test_users.json | while read i; do
        name=$(echo $i | jq -c -r ".name")
        key=$(echo $i | jq -c -r ".key")
        coins=$(echo $i | jq -c -r ".coins")
        yes "${key}${NEWLINE}" | $NODE_BIN $home0 keys add $name $kbt --recover
    done
}

function addCoinsToTestUsers() {
	echo "Adding coins for test users"
    jq -c '.[]' /root/scripts/test_users.json | while read i; do
        name=$(echo $i | jq -c -r ".name")
        key=$(echo $i | jq -c -r ".key")
        coins=$(echo $i | jq -c -r ".coins")
        if [[ ! -z "$coins" ]]; then
    		replaced_coins=$(eval echo "$coins")
			$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show "$name" -a $kbt) "$replaced_coins"
			echo "User: $name"
		fi
    done
}

NEWLINE=$'\n'

hdir="$CHAIN_DIR/$CHAIN_ID"

if [[ $# -eq 0 ]]; then
	echo "Usage: $0 COSMOS_NODE_BIN"
	exit 1
fi

if ! command -v jq &> /dev/null
then
    echo "⚠️ jq command could not be found!"
    echo "jq is a lightweight and flexible command-line JSON processor."
    echo "Install it by checking https://stedolan.github.io/jq/download/"
    exit 1
fi

# Expect Chain ID to be provided
if [[ -z "$CHAIN_ID" ]]; then
  echo "Please provide Cosmos CHAIN_ID env"
  exit 1
fi

# Expect data prefix to be provided
if [[ -z "$CHAIN_DIR" ]]; then
  echo "Please provide CHAIN_DIR data prefix"
  exit 1
fi

NODE_BIN="$1"

echo "Using $CHAIN_ID as Chain ID and $CHAIN_DIR as data prefix."
echo "Using $DENOM as Cosmos Coin Denom."
if [[ "$CLEANUP" == 1 || "$CLEANUP" == "1" ]]; then
	echo "Will remove $CHAIN_DIR"
fi
echo "Press ^C if you don't agree.."

if [[ "$CLEANUP" == 1 || "$CLEANUP" == "1" ]]; then
	rm -rf "$CHAIN_DIR"
fi

# Folders for node
n0dir="$hdir/n0"

# Home flag for folder
home0="--home $n0dir"

# Config directories for node
n0cfgDir="$n0dir/config"

# Config files for node
n0cfg="$n0cfgDir/config.toml"

# App config files for node
n0app="$n0cfgDir/app.toml"

# Common flags
kbt="--keyring-backend test"
cid="--chain-id $CHAIN_ID"

PASSPHRASE="12345678"

# Check if the data dir has been initialized already
if [[ ! -d "$hdir" ]]; then
	echo "Creating one $NODE_BIN validators with chain-id=$CHAIN_ID"

	# Build genesis file and create accounts
	if [[ "$STAKE_DENOM" != "$DENOM" ]]; then
		coins="1000000$SCALE_FACTOR$STAKE_DENOM,1000000$SCALE_FACTOR$DENOM"
	else
		coins="120000000$SCALE_FACTOR$DENOM"
	fi
	coins_user="10000000$SCALE_FACTOR$DENOM,1000000000$TEST_ERC20_DECIMALS$TEST_ERC20_DENOM,9910000000$TEST_ERC20_DECIMALS$TEST_USDC_DENOM,10000000$SCALE_FACTOR$TEST_DAI_DENOM,10000000$SCALE_FACTOR$TEST_UNI_DENOM,10000000$SCALE_FACTOR$TEST_AAVE_DENOM,10000000$SCALE_FACTOR$TEST_MATIC_DENOM,10000000$SCALE_FACTOR$TEST_ZRX_DENOM,10000000$SCALE_FACTOR$TEST_LINK_DENOM,10000000$SCALE_FACTOR$TEST_BNB_DENOM,1000$SCALE_FACTOR$TEST_YFI_DENOM,1000000000$TEST_ERC20_DECIMALS$TEST_ATOM_IBC_DENOM,10000000$SCALE_FACTOR$TEST_GF_DENOM,10000000000000$TEST_LUNA_IBC_DENOM,10000000000000$TEST_UST_IBC_DENOM",10000000$SCALE_FACTOR$TEST_WETH_DENOM

	echo "initializing node home..."

	# Initialize the home directories of each node
	$NODE_BIN $home0 $cid init n0 &>/dev/null

	# Import keys from mnemonics
	echo "Importing keys from mnemonics"
	yes "$VAL0_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $VAL0_KEY $kbt --recover
	yes "$VAL1_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $VAL1_KEY $kbt --recover
	yes "$VAL2_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $VAL2_KEY $kbt --recover
	yes "$USER0_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $USER0_KEY $kbt --recover
	yes "$USER1_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $USER1_KEY $kbt --recover
  	yes "$USER2_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $USER2_KEY $kbt --recover
	yes "$USER3_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $USER3_KEY $kbt --recover
	yes "$PROPOSER_MNEMONIC$NEWLINE" | $NODE_BIN $home0 keys add $PROPOSER_KEY $kbt --recover

  #[E2E] Import keys for mnemonics
  TEST_USER_COUNT=$(cat /root/scripts/test_users.json | jq length)
  printf "Found ${TEST_USER_COUNT} e2e test users\n"
  registerTestUsers
  addCoinsToTestUsers

  echo "Importing keys for albert, bojan, markus, eric, maxim, alex, mirza, max, venkatesh, nam, anastasia, achilleas, hannah, vivian, peiyun, danni"
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key oracle a7202c23be1dd1931808b3208f88c1cfa8b4f398f7b607198fdb6ba26634052b
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key albert fa785f9c479e305980646e75dd8c450da7df0b64efe7ba1a0b076e528133e425
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key bojan 5f1f154b9e2fad1ee73061c40e28f34dcbf0a9156352ea8e77075c310057a1dc
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key markus 6d3a06923253ffcbc557fbfeda44f16f6c5282eb378ede4e8ed313faa4bbcb78
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key eric 410eca15c066c8b9cc191ba3ebeacf09beeab45a11e98bd7e785bdc494eb984a
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key maxim bbe45ee971ca6347ae8f5d0057db87bc45226eeacc886a04744c27babc9444d5
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key alex 403a6d93a86b9c8e876408903de9588ef4b31763366bc56fbfdde006b846ed7d
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key mirza 0e78aa1b5461910b0dd929d29f4192a6a3214c545e0bc9b696eec35b5eb0c205
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key max 3928f3a3525bf930cd91e8a706ac77a03ef16e4f75abbe73c4929bbe0280bcd4
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key venkatesh AE1787BF86D3F725E1DF27E9C7F39D91CF6772BFB8BDF63A9BEC66E3A5EF3124
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key nam b8f67ff46b32ab18446a6130ad19589faad1c727b940e412d854db0fb5533dd8
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key anastasia 576f2e64cde8c56e54f1d11e31d5cdbeb5b3c834c1fd8df2168b933ca230dd91
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key achilleas 2398e85d3d90773abf530a571d2a87fa46a69bdd90c0abc3ba90e7d9bb8fbc4f
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key hannah 7f8d1b4d3c0238394cd6e52252bd305fd2c8ec40ad449614453f96b2b3a73fa1
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key vivian a214ff1293832e853a49a5126edcc4e864cbf2414b261b8898e55784b932f8b0
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key peiyun edbde3a6da2165d23c7dbfa8a5159a1253cd1a39a210aadad43296aec1e37b48
	yes $PASSPHRASE | $NODE_BIN $home0 keys unsafe-import-eth-key danni fafb1efedd7805bdbd883758323caae8c1648b38dbef1540141bb6e127ebf548

	# Add addresses to genesis
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $VAL0_KEY -a $kbt) $coins &>/dev/null
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $VAL1_KEY -a $kbt) $coins &>/dev/null
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $VAL2_KEY -a $kbt) $coins &>/dev/null
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $USER0_KEY -a $kbt) $coins_user &>/dev/null
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $USER1_KEY -a $kbt) $coins_user &>/dev/null
  	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $USER2_KEY -a $kbt) $coins_user &>/dev/null
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $USER3_KEY -a $kbt) $coins_user &>/dev/null
	$NODE_BIN $home0 add-genesis-account $($NODE_BIN $home0 keys show $PROPOSER_KEY -a $kbt) $coins_user &>/dev/null

  # Add addresses for additional keys to genesis
  echo "Adding albert, bojan, markus, eric, maxim, alex, mirza, max, venkatesh, nam, anastasia, achilleas, hannah, vivian, peiyun, danni to genesis accounts"
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show oracle -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show albert -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show bojan -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show markus -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show eric -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show maxim -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show alex -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show mirza -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show max -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show venkatesh -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show nam -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show anastasia -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show achilleas -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show hannah -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show vivian -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show peiyun -a) $coins_user
	yes $PASSPHRASE | $NODE_BIN $home0 add-genesis-account $(yes $PASSPHRASE | $NODE_BIN $home0 keys show danni -a) $coins_user

	# Patch genesis.json to better configure stuff for testing purposes
	if [[ "$STAKE_DENOM" == "$DENOM" ]]; then
		cat $n0cfgDir/genesis.json | jq '.app_state["staking"]["params"]["bond_denom"]="'$DENOM'"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
		cat $n0cfgDir/genesis.json | jq '.app_state["crisis"]["constant_fee"]["denom"]="'$DENOM'"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
		cat $n0cfgDir/genesis.json | jq '.app_state["gov"]["deposit_params"]["min_deposit"][0]["denom"]="'$DENOM'"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
		cat $n0cfgDir/genesis.json | jq '.app_state["mint"]["params"]["mint_denom"]="'$DENOM'"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
	fi

	echo "NOTE: Setting Governance Voting Period to 10 seconds for rapid testing"
	cat $n0cfgDir/genesis.json | jq '.app_state["gov"]["voting_params"]["voting_period"]="10s"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json

	echo "NOTE: Setting ibc transfer denom trace for uatom, uluna and uust denoms"
	cat $n0cfgDir/genesis.json | jq '.app_state["transfer"]["denom_traces"][0]["base_denom"]="uatom"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
	cat $n0cfgDir/genesis.json | jq '.app_state["transfer"]["denom_traces"][0]["path"]="transfer/channel-1"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
	cat $n0cfgDir/genesis.json | jq '.app_state["transfer"]["denom_traces"][1]["base_denom"]="uluna"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
	cat $n0cfgDir/genesis.json | jq '.app_state["transfer"]["denom_traces"][1]["path"]="transfer/channel-4"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
	cat $n0cfgDir/genesis.json | jq '.app_state["transfer"]["denom_traces"][2]["base_denom"]="uusd"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json
	cat $n0cfgDir/genesis.json | jq '.app_state["transfer"]["denom_traces"][2]["path"]="transfer/channel-4"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json

	echo "NOTE: Setting Insurance Fund Redemption Period to 30 seconds for rapid testing"
	cat $n0cfgDir/genesis.json | jq '.app_state["insurance"]["params"]["default_redemption_notice_period_duration"]="30s"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json

	echo "NOTE: Setting Auction Period to 60 seconds for rapid testing"
	cat $n0cfgDir/genesis.json | jq '.app_state["auction"]["params"]["auction_period"]="60"' > $n0cfgDir/tmp_genesis.json && mv $n0cfgDir/tmp_genesis.json $n0cfgDir/genesis.json

	 echo "NOTE: Setting Exchange Vesting Duration to 30 seconds for rapid testing"
	 cat "$n0cfgDir"/genesis.json | jq '.app_state["exchange"]["params"]["trading_rewards_vesting_duration"]="30"' >"$n0cfgDir"/tmp_genesis.json && mv "$n0cfgDir"/tmp_genesis.json "$n0cfgDir"/genesis.json

	# Create gentxs and collect them in n0
	$NODE_BIN $home0 gentx $VAL0_KEY 1000$SCALE_FACTOR$STAKE_DENOM $kbt $cid
	$NODE_BIN $home0 collect-gentxs &>/dev/null

	# Run this to ensure everything worked and that the genesis file is setup correctly
	$NODE_BIN $home0 validate-genesis

	# Actually a cross-platform solution, sed is rubbish
	# Example usage: $REGEX_REPLACE 's/^param = ".*?"/param = "100"/' config.toml
	REGEX_REPLACE="perl -i -pe"

	echo "regex replacing config variables"

	$REGEX_REPLACE 's|addr_book_strict = true|addr_book_strict = false|g' $n0cfg
	$REGEX_REPLACE 's|external_address = ""|external_address = "tcp://0.0.0.0:26657"|g' $n0cfg
	$REGEX_REPLACE 's|"tcp://127.0.0.1:26657"|"tcp://0.0.0.0:26657"|g' $n0cfg
	$REGEX_REPLACE 's|allow_duplicate_ip = false|allow_duplicate_ip = true|g' $n0cfg
	$REGEX_REPLACE 's|log_level = "info"|log_level = "'$LOG_LEVEL'"|g' $n0cfg
	$REGEX_REPLACE 's|timeout_commit = ".*?"|timeout_commit = "1s"|g' $n0cfg
fi # data dir check


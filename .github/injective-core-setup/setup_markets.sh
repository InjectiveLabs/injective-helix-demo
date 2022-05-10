#!/bin/sh
TX_OPTS="--fees=200000000000000inj --gas=auto --from=proposer --chain-id=injective-777 --broadcast-mode=block --deposit=1000000000000000000000inj --yes"
TX_OPTS_NO_DEPOSIT="--fees=200000000000000inj --gas=auto --from=proposer --chain-id=injective-777 --broadcast-mode=block --yes"
HOME="--home /root/var/data/injective-777/n0"
KBT="--keyring-backend test"
PASSPHRASE="12345678"
CWD=$(pwd)
NODE="--node=tcp://$NODE_ADDRESS:$NODE_PORT"
LCD_PORT="10337"
FLAG_FILE="$CWD/markets_setup.flag"

vote() {
        PROPOSAL_ID=$1
        yes $PASSPHRASE | injectived tx gov vote $PROPOSAL_ID yes --chain-id=injective-777 --gas-prices 500000000inj $KBT --broadcast-mode=block --yes $HOME --from=val $NODE
}

fetch_proposal_id() {
    current_proposal_id=$(curl "http://${NODE_ADDRESS}:${LCD_PORT}/cosmos/gov/v1beta1/proposals?proposal_status=0&pagination.limit=1&pagination.reverse=true" | jq -r '.proposals[].proposal_id')
    proposal=$((current_proposal_id))
}

function execute_all_proposals() {
    if [ -f "$FLAG_FILE" ]; then
        echo "Markets already setup. Exiting."
        exit 0
    fi

    echo $(curl --fail http://$NODE_ADDRESS:$NODE_PORT)
    echo "Waiting for Injective Node to be online."
    while [ "$(curl --fail http://$NODE_ADDRESS:$NODE_PORT)" == "1" ]; do
        echo -n '.'
        sleep 2
    done

    echo $(curl --fail http://$NODE_ADDRESS:$LCD_PORT)
    echo "Waiting for LCD to be online."
    while [ "$(curl --fail http://$NODE_ADDRESS:$LCD_PORT)" == "1" ]; do
        echo -n '.'
        sleep 2
    done

	echo "Setting up markets and submitting required proposals."
    echo "Will use node: $NODE_ADDRESS:$NODE_PORT"
    jq -c '.[]' "${CWD}/test_env_proposals.json" | while read i; do
        directive=$(echo $i | jq -c -r ".directive")

        if [ $directive = "launch-spot-market" ]; then
            launch_spot_market "$i"
        elif [ $directive = "launch-perp-market" ]; then
            launch_perp_market "$i"
        elif [ $directive = "fee-discount" ]; then
            fee_discount "$i"
        elif [ $directive = "launch-trade-rewards" ]; then
            launch_trade_rewards "$i"
        elif [ $directive = "authorize-band-ibc-oracle" ]; then
            authorize_band_ibc_oracle "$i"
        else
            echo "Unknown directive: ${directive}!"
            exit 1
        fi
        sleep 5
    done

    touch "$FLAG_FILE"
}

function launch_spot_market() {
    data=$1
    ticker=$(echo $data | jq -c -r ".ticker")
    base_denom=$(echo $data | jq -c -r ".base_denom")
    quote_denom=$(echo $data | jq -c -r ".quote_denom")
    min_price_tick_size=$(echo $data | jq -c -r ".min_price_tick_size")
    min_quantity_tick_size=$(echo $data | jq -c -r ".min_quantity_tick_size")

    echo "yes $PASSPHRASE | injectived tx exchange instant-spot-market-launch "$ticker" $base_denom $quote_denom $TX_OPTS_NO_DEPOSIT $KBT $HOME --min-price-tick-size=$min_price_tick_size --min-quantity-tick-size=$min_quantity_tick_size $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx exchange instant-spot-market-launch "$ticker" $base_denom $quote_denom $TX_OPTS_NO_DEPOSIT $KBT $HOME --min-price-tick-size=$min_price_tick_size --min-quantity-tick-size=$min_quantity_tick_size $NODE
}

function authorize_band_ibc_oracle() {
    data=$1
    symbols=$(echo $data | jq -c -r ".symbols")
    title="Enable Band IBC with a request interval of 10 blocks"
    description="Enable Band IBC with a request interval of 10 blocks"

    echo "yes $PASSPHRASE | injectived tx oracle enable-band-ibc-proposal true 10 --port-id="oracle" --channel="channel-0" --ibc-version="bandchain-1" --title="$title" --description="$description" $TX_OPTS $HOME $KBT $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx oracle enable-band-ibc-proposal true 10 --port-id="oracle" --channel="channel-0" --ibc-version="bandchain-1" --title="$title" --description="$description" $TX_OPTS $HOME $KBT $NODE
    fetch_proposal_id
    vote $proposal

    sleep 2

    echo "yes $PASSPHRASE | injectived tx oracle authorize-band-oracle-request-proposal 1 --symbols="$symbols" --requested-validator-count=1 --sufficient-validator-count=1 --prepare-gas=50000 --fee-limit="1000uband" --execute-gas=300000 --title="$title" --description="$description" $TX_OPTS $HOME $KBT $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx oracle authorize-band-oracle-request-proposal 1 --symbols="$symbols" --requested-validator-count=1 --sufficient-validator-count=1 --prepare-gas=50000 --fee-limit="1000uband" --execute-gas=300000 --title="$title" --description="$description" $TX_OPTS $HOME $KBT $NODE
    fetch_proposal_id
    vote $proposal
}

function launch_perp_market() {
    data=$1
    ticker=$(echo $data | jq -c -r ".ticker")
    oracle_base=$(echo $data | jq -c -r ".oracle_base")
    oracle_quote=$(echo $data | jq -c -r ".oracle_quote")
    quote_denom=$(echo $data | jq -c -r ".quote_denom")
    oracle_type=$(echo $data | jq -c -r ".oracle_type")
    oracle_scale_factor=$(echo $data | jq -c -r ".oracle_scale_factor")
    relayer_address=$(echo $data | jq -c -r ".relayer_address")
    starting_price=$(echo $data | jq -c -r ".starting_price")
    min_price_tick_size=$(echo $data | jq -c -r ".min_price_tick_size")
    min_quantity_tick_size=$(echo $data | jq -c -r ".min_quantity_tick_size")

    echo "yes $PASSPHRASE | injectived tx oracle grant-price-feeder-privilege-proposal $oracle_base $oracle_quote $relayer_address --title="Grant PriceFeeder Privileges for the ${oracle_base}/${oracle_quote} PriceFeed Oracle" --description="This proposal grants PriceFeeder privileges for the ${oracle_base}/${oracle_quote} PriceFeed Oracle." --deposit="1000000000000000000000inj" $HOME $KBT $TX_OPTS $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx oracle grant-price-feeder-privilege-proposal $oracle_base $oracle_quote $relayer_address --title="Grant PriceFeeder Privileges for the ${oracle_base}/${oracle_quote} PriceFeed Oracle" --description="This proposal grants PriceFeeder privileges for the ${oracle_base}/${oracle_quote} PriceFeed Oracle." --deposit="1000000000000000000000inj" $HOME $KBT $TX_OPTS $NODE
    fetch_proposal_id
    vote $proposal
    sleep 20

    echo "yes $PASSPHRASE | injectived tx oracle relay-price-feed-price $oracle_base $oracle_quote "$starting_price" $TX_OPTS_NO_DEPOSIT $KBT $HOME $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx oracle relay-price-feed-price $oracle_base $oracle_quote "$starting_price" $TX_OPTS_NO_DEPOSIT $KBT $HOME $NODE
    sleep 5

    echo "yes $PASSPHRASE | injectived tx insurance create-insurance-fund --ticker="$ticker" --quote-denom=$quote_denom --oracle-base=$oracle_base --oracle-quote=$oracle_quote --oracle-type=$oracle_type --expiry="-1" --initial-deposit="100000000${quote_denom}" $TX_OPTS_NO_DEPOSIT $KBT $HOME $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx insurance create-insurance-fund --ticker="$ticker" --quote-denom=$quote_denom --oracle-base=$oracle_base --oracle-quote=$oracle_quote --oracle-type=$oracle_type --expiry="-1" --initial-deposit="100000000${quote_denom}" $TX_OPTS_NO_DEPOSIT $KBT $HOME $NODE
    sleep 5

    echo "yes $PASSPHRASE | injectived tx exchange instant-perpetual-market-launch --maker-fee-rate=0.003000000000000000 --maintenance-margin-ratio=0.400000000000000000 --initial-margin-ratio=0.800000000000000000 --taker-fee-rate=0.005000000000000000 --min-price-tick-size=$min_price_tick_size  --min-quantity-tick-size=$min_quantity_tick_size --oracle-base=$oracle_base --oracle-quote=$oracle_quote --oracle-scale-factor=$oracle_scale_factor --oracle-type=$oracle_type --ticker="$ticker" --quote-denom=$quote_denom $TX_OPTS_NO_DEPOSIT $KBT $HOME $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx exchange instant-perpetual-market-launch --maker-fee-rate=0.003000000000000000 --maintenance-margin-ratio=0.400000000000000000 --initial-margin-ratio=0.800000000000000000 --taker-fee-rate=0.005000000000000000 --min-price-tick-size=$min_price_tick_size  --min-quantity-tick-size=$min_quantity_tick_size --oracle-base=$oracle_base --oracle-quote=$oracle_quote --oracle-scale-factor=$oracle_scale_factor --oracle-type=$oracle_type --ticker="$ticker" --quote-denom=$quote_denom $TX_OPTS_NO_DEPOSIT $KBT $HOME $NODE
}

function launch_trade_rewards() {
    data=$1
    file=$(echo $data | jq -c -r ".file")

    echo "yes $PASSPHRASE | injectived tx exchange trading-reward-campaign-launch-proposal --proposal $file $TX_OPTS $KBT $HOME --fees=500000000000000inj $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx exchange trading-reward-campaign-launch-proposal --proposal $file $TX_OPTS $KBT $HOME --fees=500000000000000inj $NODE
    fetch_proposal_id
    vote $proposal
}

function fee_discount() {
    data=$1
    file=$(echo $data | jq -c -r ".file")

    echo "yes $PASSPHRASE | injectived tx exchange fee-discount-proposal --proposal $file $TX_OPTS $KBT $HOME $NODE" >> commands.log
    yes $PASSPHRASE | injectived tx exchange fee-discount-proposal --proposal $file $TX_OPTS $KBT $HOME $NODE
    fetch_proposal_id
    vote $proposal
}

execute_all_proposals
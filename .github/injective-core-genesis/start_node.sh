#!/bin/sh
if [ ! -f /root/var/data/chain-initialised.flag ]; then
    echo "Initialising chain"
    /root/scripts/singlenode-setup-ci.sh injectived
    touch /root/var/data/chain-initialised.flag
else
    echo "Chain already initialized"
fi
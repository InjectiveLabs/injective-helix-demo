#!/usr/bin/env bash
# Taken from https://github.com/alefiori82/mongo-replica-boilerplate

if [ ! -f /data/mongo-init.flag ]; then
    echo "Init replicaset"
    mongo mongodb://mongo:27017 mongo-setup.js
    touch /data/mongo-init.flag
else
    echo "Replicaset already initialized"
fi
#!/usr/bin/env bash

set -e

SHELL_VERSION="99.99.99"

echo "Running e2e tests from Dashboard CI pipeline"

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
BASE_DIR="$( cd $SCRIPT_DIR && cd .. & pwd)"
SHELL_DIR=$BASE_DIR/shell/

# update package.json to use a specific version of shell
sed -i.bak -e "s/\"\@rancher\/shell\": \"[0-9]*.[0-9]*.[0-9]*\",/\"\@rancher\/shell\": \"${SHELL_VERSION}\",/g" ${BASE_DIR}/package.json
rm ${BASE_DIR}/package.json.bak

# install dependencies
echo "Installing dependencies"
yarn install

# Run e2e tests
echo "Running e2e tests"
yarn test:ci

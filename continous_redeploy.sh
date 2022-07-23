#!/bin/bash

# This script is meant to to run as a cron jobn every day or so to fetch the latest version

set -e

cd "$(dirname "$0")"

bash teardown.sh

git stash

git pull

git stash pop

bash startup.sh
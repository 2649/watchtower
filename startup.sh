#!/bin/bash
set -e

cd "$(dirname "$0")"

export PUBLIC_URL="$(ip route get 8.8.8.8 | sed -n '/src/{s/.*src *\([^ ]*\).*/\1/p;q}')"

echo "deploy for ${curretnIP}"

docker run --workdir="/watchtower" -v "$(pwd)/watchtower:/watchtower/" -it node:16 /bin/bash -c "yarn && yarn build"

mkdir -p backend/watchtower

cp -r watchtower/build/ backend/watchtower

docker-compose build

docker-compose up -d

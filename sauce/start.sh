#!/bin/bash

set -e

PLATFORM=$(uname)
SC_VERSION="4.3.7"
WORK_DIR="$(pwd)/.sauce"

SC_DIR="${WORK_DIR}/sc"
READY_FILE="${WORK_DIR}/sc.ready"
PID_FILE="${WORK_DIR}/sc.pid"

if [[ $PLATFORM == 'Darwin' ]]; then
  SC_PACKAGE="sc-${SC_VERSION}-osx.zip"
else
  SC_PACKAGE="sc-${SC_VERSION}-linux.tar.gz"
fi

SC_URL="https://saucelabs.com/downloads/${SC_PACKAGE}"
SC_PACKAGE_PATH="${WORK_DIR}/${SC_PACKAGE}"

mkdir -p $WORK_DIR

if [ ! -d $SC_DIR ]; then
  echo 'Downloading Sauce Connect binary'
  curl -o $SC_PACKAGE_PATH $SC_URL
  if [[ $PLATFORM == 'Darwin' ]]; then
    unzip $SC_PACKAGE_PATH -d $WORK_DIR
    mv "${WORK_DIR}/sc-${SC_VERSION}-osx" $SC_DIR
  else
    tar -xf $SC_PACKAGE_PATH -C $WORK_DIR
    mv "${WORK_DIR}/sc-${SC_VERSION}-linux" $SC_DIR
  fi
fi

cd $SC_DIR
rm -f sauce_connect.log
touch sauce_connect.log

i=0
while [ "$i" -lt 3 ]; do
  echo "Sauce Connect startup attempt ${i}"
  i=$((i+1))
  bin/sc \
    --direct-domains *.wbx2.com,*.webex.com,*.sc-tx2.huron-dev.com,*.huron-int.com \
    --no-ssl-bump-domains *.atlasad.koalabait.com \
    -vv \
    -l sauce_connect.log \
    --logfile sauce_connect.log \
    --pidfile $PID_FILE \
    --readyfile $READY_FILE \
    --tunnel-identifier $SC_TUNNEL_IDENTIFIER \
    > /dev/null 2>&1 \
    &

  echo 'Connecting to Sauce Labs - waiting a maximum 120s for ready file . . .'
  x=0
  while [ "$x" -lt 120 -a ! -e $READY_FILE ]; do
    x=$((x+1))
    sleep 1
  done

  if [ -e $READY_FILE ]; then
    echo 'Done'
    exit 0
  fi

  echo 'No ready file, killing sc process and trying again . . .'
  if [ -e $PID_FILE ]; then
    cat $PID_FILE | xargs kill -9
  fi
done

echo 'Failed to connect to Sauce Labs after 3 tries!'
exit 1
#!/bin/bash

set -e

WORK_DIR="$(pwd)/.sauce"

SC_DIR="${WORK_DIR}/sc"
READY_FILE="${WORK_DIR}/sc.ready"
PID_FILE="${WORK_DIR}/sc.pid"

echo "Disconnecting from Sauce Labs"
kill -TERM $(cat $PID_FILE)
while [ -f $READY_FILE ] ;
do
  sleep 2
done
echo 'Done'
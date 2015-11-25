#!/bin/bash

# import helper functions
source ./bin/pid-helpers

# -----
# Phase 1: Pre-setup
# - look for any zombie instances of process names (there shouldn't be any when Jenkins runs this)
proc_names_to_scan="bin\\/sc gulp bin\\/spin"
for i in $proc_names_to_scan; do
    if [ -n "`get_pids $i`" ]; then
        echo "WARNING: stale process found: $i"
        kill_wait "$i"
    fi
done

# -----
# Phase 2: Setup
source ./bin/setup-helpers

# ex.
echo "Inspecting checksums of 'package.json' and 'bower.json' from last successful build... "
manifest_checksums_file=".manifest-checksums"
checksums_ok=`is_checksums_ok $manifest_checksums_file && echo "true" || echo "false"`

echo "Checking dependency dirs ('node_modules' and 'bower_components') still exist..."
dependency_dirs="./node_modules ./bower_components"
dirs_ok=`dirs_exist $dependency_dirs && echo "true" || echo "false"`

echo "Checking if it is time to refresh..."
min_refresh_period=$(( 60 * 60 * 24 ))  # 24 hours
last_refreshed_file=".last-refreshed"
time_to_refresh=`is_time_to_refresh $min_refresh_period $last_refreshed_file \
    && echo "true" || echo "false"`

echo "INFO: checksums_ok: $checksums_ok"
echo "INFO: dirs_ok: $dirs_ok"
echo "INFO: time_to_refresh: $time_to_refresh"
if [ "$checksums_ok"    = "true" -a \
     "$dirs_ok"         = "true" -a \
     "$time_to_refresh" = "false" ]; then
    echo "Install manifests haven't changed, dependency dirs still exist, and not yet time to" \
        "refresh, skipping 'setup.sh'..."
else
    ./setup.sh

    # check that npm installed successfully
    npm_installed=`which npm >/dev/null 2>&1 && echo "true" || echo "false"`

    if [ "$npm_installed" = "false" ]; then
        # setup failed, cleanup checksums file and abort
        rm $manifest_checksums_file
        exit 1
    else
        # setup succeeded, update checksums file and timestamp of last refresh
        manifest_files="package.json bower.json"
        mk_checksum_file $manifest_checksums_file $manifest_files
        mk_last_refreshed_file $last_refreshed_file
    fi
fi

# -----
# Phase 3: Build
gulp clean || exit $?
gulp tsd || exit $?
gulp jsb:verify || exit $?
gulp e2e --sauce --production-backend --nolint || exit $?

# -----
# Phase 4: Package
# Check build number
if [ -n "$BUILD_NUMBER" ]; then
    echo "Build Number: $BUILD_NUMBER"
else
    echo "Build Number not set $BUILD_NUMBER"
    BUILD_NUMBER=0
fi
rm -f wx2-admin-web-client.*.tar.gz
tar -zcvf wx2-admin-web-client.$BUILD_NUMBER.tar.gz dist/*
tar -zcvf coverage.tar.gz coverage/unit/*

exit $?

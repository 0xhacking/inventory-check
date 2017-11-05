#!/bin/bash

source ./bin/include/setup-helpers
quick="false"

# optional CLI switches
if [ -n "$1" ]; then
    case "$1" in
        "-h"|"--help" )
            echo "useage: `basename $0` [--restore|--restore-soft] [--quick]"
            echo ""
            echo "ex. Run with no args to build dependencies"
            echo "  `basename $0`"
            echo ""
            echo "ex. Use '--restore' to restore the most recently built dependencies (if available)"
            echo "  `basename $0` --restore"
            echo ""
            echo "  Same as above, but prevent overwriting manifest files"
            echo "  `basename $0` --restore-soft"
            echo ""
            echo "ex. Run with '--quick' to skip removing component directores"
            echo ""
            exit 1
            ;;

        "--restore-soft" )
            # restore deps dirs, but keep manifest files if newer
            echo "Restoring previously built dependencies, but keeping newer files..."
            restore_latest_deps --keep-newer-files
            exit $?
            ;;

        "--restore" )
            echo "Restoring previously built dependencies..."
            restore_latest_deps
            exit $?
            ;;

        "--quick" )
            quick="true"
            ;;
    esac
fi

# Check if rvm is installed, otherwise install it
# rvm --version > /dev/null 2>&1
# RVM_RET=$?
# if [ $RVM_RET -ne 0 ]; then
#     echo "RVM not found, installing:"
#     \curl -sSL https://get.rvm.io | bash -s stable --ruby
# else
#     echo "RVM is already installed"
# fi

# Check if brew is installed, otherwise install it
if [ "`uname`" = "Darwin" ]; then
  brew --version > /dev/null 2>&1
  BREW_RET=$?
  if [ $BREW_RET -ne 0 ]; then
      echo "BREW not found, installing:"
      ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  else
      echo "BREW is already installed"
  fi
fi

# Check and install npm
npm --version > /dev/null 2>&1
NPM_RET=$?
if [ $NPM_RET -ne 0 ]; then
    echo "npm not found, installing:"
    if [ "`uname`" = "Darwin" ]; then
      brew install npm
    else
      echo "Please install npm (for CentOS, see: http://serverfault.com/questions/299288/how-do-you-install-node-js-on-centos )."
    fi
else
    echo "NPM is already installed"
fi

# Remove component directories
if [ $quick = "false" ]; then
  echo "Removing component directories..."
  # remove deprecated bower_components to clean up workspace
  rm -rf bower_components
  rm -rf node_modules
fi

# check for and install GNU Parallel as-appropriate
install_parallel_as_needed || exit 1

# check for and install C++ compiler
install_cpp_compiler_as_needed || exit 1

# # Check for cleanup script and run
# ls -al ./cleanUpManagedOrgs.sh > /dev/null 2>&1
# CLEANUP_RET=$?
# if [ $CLEANUP_RET -ne 0 ]; then
#   echo "cleanup script not found, ignoring cleanup..."
# else
#   echo "cleanup script found, running cleanup"
#   ./cleanUpManagedOrgs.sh
# fi

time_start=$(date +"%s")

# Install dependecies
echo "Install all dependencies..."
npm install || exit $?

# npm install succeeded
# - make a tar archive of the npm-shrinkwrap.json file, and rm older versions
npm shrinkwrap --dev
mv_npm_shrinkwrap_file
rm_all_but_last 1 .cache/npm-shrinkwrap-for-*.json
mk_npm_shrinkwrap_tar
rm_all_but_last 1 .cache/npm-shrinkwrap-for-*.tar.gz

# - make a tar archive of the npm deps, and rm older versions
mk_npm_deps_tar
rm_all_but_last 1 .cache/npm-deps-for-*.tar.gz

time_npm=$(date +"%s")
npm_duration=$(($time_npm-$time_start))
echo "npm completed after $(($npm_duration / 60)) minutes and $(($npm_duration % 60)) seconds."

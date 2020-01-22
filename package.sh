#!/usr/bin/env bash
set -e

TARGET_PKG=package.zip
VENDOR_DIR=node_modules
DIST_DIR=dist

function clean_package() {
    echo -n "deleting already built package..."
    [ -f $TARGET_PKG ] && rm -f $TARGET_PKG
    [ -d $DIST_DIR ] && rm -rf $DIST_DIR
    echo "  OK  "
}

function compile() {
    echo -n "compiling typescript..."
    tsc && echo -n "  OK  "
    echo
}

function package() {
    echo "creating package..."
    zip -r $TARGET_PKG $VENDOR_DIR $DIST_DIR && echo "successfully created package"
}


clean_package && compile && package
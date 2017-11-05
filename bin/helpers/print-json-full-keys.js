#!/usr/bin/env node

var path = require('path');
var stdout = process.stdout;
var _ = require('lodash');
var argv = require('yargs')
  .usage('Usage: $0 <json_file>')
  .demand(1)
  .argv;

// when piping to/from a node process, we need to set a handler for the 'EPIPE' error event
stdout.on('error', function (err) {
  if (err.code === 'EPIPE') {
    return process.exit();
  }
});

// rough estimation of when an element of a collection is considered acceptable for printing
// - it just needs to not be an object, and if it is, it needs to not have children
function isLeafyEnough(val) {
  if (!_.isObject(val)) {
    return true;
  }
  var obj = val;
  var result = true;
  // iterate over own enumerable string keyed properties, if there are any present then we know the
  // object is not leafy enough
  _.forOwn(obj, function () {
    result = false;
    return false;
  });
  return result;
}

function printLeaf(key, val, fullPathName) {
  var str = [fullPathName, key].join('.');
  str = str + ': ' + val + '\n';
  str = str.substring(1);
  stdout.write(str);
}

// recursive function to walk the tree of an object
function walkTree(key, val, fullPathName) {
  if (isLeafyEnough(val)) {
    printLeaf(key, val, fullPathName);
  } else {
    // value is an object, recurse (but also append the current key name to the full path)
    var obj = val;
    var _fullPathName = [fullPathName, key].join('.');
    _.forEach(obj, function (v, k) {
      walkTree(k, v, _fullPathName);
    });
  }
}

var jsonFile = argv._[0];
if (!path.isAbsolute(jsonFile)) {
  jsonFile = path.join(__dirname, jsonFile);
}
var jsonData = require(jsonFile);
_.forEach(jsonData, function (val, key) {
  walkTree(key, val, '');
});

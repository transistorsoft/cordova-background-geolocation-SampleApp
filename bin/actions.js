'use strict';

const fs = require("fs");
const path = require('path');
const { spawn } = require("child_process");

const YELLOW = '\x1b[33m%s\x1b[0m';
const GREEN = '\x1b[32m';
const COLOR_RESET = "\x1b[0m";

const MODULE_NAME = "cordova-background-geolocation";
const NODE_MODULES = path.join('.', 'node_modules');

const PRIVATE_MODULE_PATH = path.join(NODE_MODULES, MODULE_NAME);
const PUBLIC_MODULE_PATH = PRIVATE_MODULE_PATH + "-lt";

const COMMAND_LINK = 'link';
const COMMAND_REINSTALL = 'reinstall';

const MENU = {};

function registerCommand(name, description, handler) {
  MENU[name] = {
    description: description,
    handler: handler
  };
}

/// ACTION: link
registerCommand(COMMAND_LINK, 'Symlink TSLocationManager.xcframework, tslocationmanager.aar', function() {
  link();
});

/// ACTION: reinstall
///
registerCommand(COMMAND_REINSTALL, 'Re-install the currently installed background-geolocation plugin', function() {
  reinstall();
});

/// Symlink the [iOS] TSLocationManager.framework [Android] tslocationmanager.aar
///
async function link() {
  const fs = require("fs");
  const path = require('path');
  const rimraf = require("rimraf");

  const SRC_ROOT = path.join('/Volumes/Glyph2TB/Users/chris/workspace/cordova/background-geolocation');
  const SRC_MODULE = path.join(SRC_ROOT, MODULE_NAME);

  const ANDROID_LIBS_DIR = path.join("libs", "com", "transistorsoft", "tslocationmanager");
  const IOS_LIBS_DIR = "TSLocationManager.xcframework";

  var iosLibsPath = '';
  if (fs.existsSync(PUBLIC_MODULE_PATH)) {
    iosLibsPath = path.join("platforms", "ios", "BG\ Geo", "Plugins", MODULE_NAME + "-lt");
  } else if (fs.existsSync(PRIVATE_MODULE_PATH)) {
    iosLibsPath = path.join("platforms", "ios", "BG\ Geo", "Plugins", MODULE_NAME);
  } else {
    console.error('ERROR: Failed to find ', MODULE_NAME);
    return -1;
  }
  iosLibsPath = path.join(iosLibsPath, IOS_LIBS_DIR);

  var androidLibsPath = path.join('platforms', 'android', 'app', ANDROID_LIBS_DIR);
  var androidLibsPathReverse = androidLibsPath + "-reverse";

  // Destroy / unlink existing libs.
  [androidLibsPath, androidLibsPathReverse, iosLibsPath].forEach(function(libs) {
    console.log('[dir]', libs);
    if (fs.existsSync(libs)) {
      var stats = fs.lstatSync(libs);
      console.log('- symlink?', stats.isSymbolicLink(), 'dir?', stats.isDirectory());
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(libs);
      } else if (stats.isDirectory()) {
        rimraf.sync(libs);
      }
    } else {
      console.log('- Folder not found');
    }
  });


  // Symlink tslocationmanager.aar -> src project.
  var src = path.join(SRC_MODULE, "src", "android", ANDROID_LIBS_DIR);

  fs.symlinkSync(src, androidLibsPath);
  fs.symlinkSync(src + "-reverse", androidLibsPathReverse);

  // Symlink TSLocationManager.framework -> src project.
  src = path.join(SRC_MODULE, "src", "ios", IOS_LIBS_DIR);
  fs.symlinkSync(src, iosLibsPath);
}

/// Re-install the currently installed plugin
///
async function reinstall() {
  var pluginName = null;
  if (fs.existsSync(PUBLIC_MODULE_PATH)) {
    pluginName += "-lt";
  } else if (fs.existsSync(PRIVATE_MODULE_PATH)) {
    pluginName = MODULE_NAME;
  }
  if (pluginName) {
    try {
      await remove(pluginName);
    } catch (error) {
      console.error(YELLOW, error);
    }
  } else {
    pluginName = MODULE_NAME;
  }
  try {
    await add(pluginName);
  } catch(error) {
    console.error(YELLOW, error);
  }
}

/// Remove plugin
///
function remove(pluginName) {
  return new Promise(function(resolve, reject) {
    console.log('- remove:', pluginName);

    const ls = spawn("cordova", ["plugin", "remove", pluginName]);

    ls.stdout.on("data", data => {
        console.log(GREEN, data.toString());
    });

    ls.stderr.on("data", data => {
        console.log(YELLOW, data.toString());
    });

    ls.on('error', (error) => {
        console.log(YELLOW, error.message);
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        if (code == 0) {
          resolve(code);
        } else {
          reject(code);
        }
    });
  });
}

/**
* Add the plugins
*/
function add(pluginName) {
  return new Promise(function(resolve, reject) {
    console.log('- add:', pluginName);

    const ls = spawn("ionic", ["cordova", "plugin", "add", path.join('..', pluginName)]);

    ls.stdout.on("data", data => {
        console.log(GREEN, data.toString());
    });

    ls.stderr.on("data", data => {
        console.log(YELLOW, data.toString());
    });

    ls.on('error', (error) => {
        console.log(YELLOW, error.message);
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        if (code == 0) {
          resolve(code);
        } else {
          reject(code);
        }
    });
  })
}

module.exports = {
  actions: MENU
};


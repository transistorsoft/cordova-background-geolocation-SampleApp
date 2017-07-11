var fs = require ('fs');
var path = require('path');

var sourcePath = path.resolve(__dirname, 'build-extras.gradle');
var destPath = path.resolve(process.cwd(), 'platforms', 'android', 'build-extras.gradle');

// cp scripts/android/build-extras.gradle platforms/android/build-extras.gradle
fs.createReadStream(sourcePath).pipe(fs.createWriteStream(destPath));

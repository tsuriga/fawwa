const { join } = require('path');

const { exists } = require('fs-jetpack');
const tar = require('tar');


const gzipPath = join('build', 'dict.tgz');

if (exists(gzipPath) !== 'file') {
  throw new Error('Dictionary archive could not be read');
}

tar.extract({ sync: true, strict: true, file: gzipPath, cwd: 'static' });

console.log(`Dictionary extracted from ${gzipPath}`);

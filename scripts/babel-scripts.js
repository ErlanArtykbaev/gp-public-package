const { lstatSync, readdirSync } = require('fs');
const rimraf = require('rimraf-promise');
const path = require('path');
const colors = require('colors');
const exec = require('child-process-promise').exec;

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
const getPackages = source => getDirectories(source).map(name => path.resolve(__dirname, '..', name));
const TYPESCRIPT_BUILD_COMMAND = `tsc -p ${path.join(__dirname, 'build', 'tsconfig.json')}`;

function runBabel(options) {
  const { clear, watch, copy = true } = options;
  const args = () => `${copy ? '--copy-files' : ''} ${watch ? '--watch' : ''}`;
  return (modulePath) => {
    const lib = path.join(modulePath, 'lib');
    const src = path.join(modulePath, 'src');

    const action = clear
      ? () => rimraf(lib)
      : () => Promise.resolve();

    return action()
      .then(() => {
        const babelCli = `babel ${src} --out-dir ${lib} ${args()}`;
        return exec(babelCli).fail((error) => {
          console.log('babel built', colors.red(error));
        });
      }).then(() => {
        console.log(`babel built ${lib}`.green);
      });
  };
}

const compileModule = runBabel({ clear: true });
const watchModule = runBabel({ watch: true });

function build(sources) {
  console.log('Building packages'.yellow);
  sources.forEach(async (source) => {
    const sourcePackages = getPackages(source);
    const compilePromiseList = sourcePackages.map(compileModule);

    try {
      await Promise.all(compilePromiseList);
      console.log('Тайпскрипт пошёл!'.yellow);
      await exec(TYPESCRIPT_BUILD_COMMAND);
      console.log(`Packages from ${source} has been built`.green);
    } catch (error) {
      console.log('Что-то сдохло, но это не критично. Когда всё будет на тайпскрипт, то ошибок не будет.'.yellow);
      console.log(`${error.stdout}`.blue);
    }
  });
}

function watch(sources) {
  console.log('Watch for packages'.yellow);
  sources.forEach((source) => {
    const sourcePackages = getPackages(source);
    sourcePackages.forEach(watchModule);
  });
}

module.exports = {
  watch,
  build,
};

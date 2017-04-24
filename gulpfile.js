/* eslint import/no-extraneous-dependencies:0 */
const gulp = require('gulp');
const del = require('del');
const stylus = require('gulp-stylus');
const base64 = require('gulp-base64');
const nib = require('nib');
const cssmin = require('gulp-cssmin');
const copy = require('gulp-copy');
const path = require('path');
const through = require('through2');
const webpack = require('webpack');
const crc32 = require('crc').crc32;
const _ = require('lodash');
const fs = require('fs');

const webpackConfig = require('./webpack.config');

const uglify = new webpack.optimize.UglifyJsPlugin({
  mangle: {
    except: ['$super', '$', 'exports', 'require'],
  },
});

const definePlugin = new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('production'),
  },
});

webpackConfig.plugins.push(uglify);
webpackConfig.plugins.push(definePlugin);
webpackConfig.output.filename = '[name].[chunkhash].js';

const assetsPath = 'assets';
// 保存静态文件的crc32版本号
const crc32Versions = {};
function version(opts) {
  function addVersion(file, encoding, cb) {
    const v = crc32(file.contents);
    const extname = path.extname(file.path);
    let name = file.path.substring(file.base.length - 1);
    if (opts && opts.prefix) {
      name = opts.prefix + name;
    }
    crc32Versions[name] = `${v}`;
    /* eslint no-param-reassign:0 */
    file.path = file.path.replace(extname, `.${v}${extname}`);
    cb(null, file);
  }
  return through.obj(addVersion);
}

gulp.task('del:assets', () => del([assetsPath]));

gulp.task('del:build', () => del(['build', 'public/bundle']));

gulp.task('clean', ['crc32'], () => del(['build']));


gulp.task('stylus', ['del:assets', 'del:build'], () => gulp.src('public/**/*.styl')
  .pipe(stylus({
    use: nib(),
  }))
  .pipe(base64())
  .pipe(cssmin())
  .pipe(gulp.dest('build')));

gulp.task('copy:others', ['del:assets', 'del:build'], () => gulp.src([
  'public/**/*',
  '!public/**/*.styl',
  '!public/**/*.js',
]).pipe(copy('build', {
  prefix: 1,
})));

gulp.task('copy:source', ['del:assets', 'del:build'], () => gulp.src([
  'public/fonts/*',
]).pipe(copy(assetsPath, {
  prefix: 1,
})));

gulp.task('static:css', ['stylus', 'copy:others'], () => gulp.src(['build/**/*.css'])
  .pipe(base64())
  .pipe(cssmin())
  .pipe(version())
  .pipe(gulp.dest(assetsPath)));

gulp.task('static:js', ['copy:others'], () => gulp.src(['public/bundle/*.js'])
  .pipe(version())
  .pipe(gulp.dest(assetsPath)));

gulp.task('webpack:bundle', (cb) => {
  webpack(webpackConfig, cb);
});

gulp.task('static:webpack-compile', ['webpack:bundle'], () => gulp.src(['public/bundle/*'])
  .pipe(copy('build', {
    prefix: 1,
  })));

gulp.task('static:webpack', ['static:webpack-compile'], () => gulp.src(['build/bundle/*.js'])
  .pipe(copy(assetsPath, {
    prefix: 1,
  })));

gulp.task('static:webpack-sourcemap', ['webpack:bundle'], () => gulp.src(['public/bundle/*.map'])
  .pipe(copy(assetsPath, {
    prefix: 1,
  })));

gulp.task('static:webpack-version', ['static:webpack', 'static:webpack-sourcemap'], () => gulp.src([`${assetsPath}/bundle/*.js`])
  .pipe(through.obj((file, encoding, cb) => {
    const fileName = file.path.replace(path.join(__dirname, assetsPath), '');
    const arr = fileName.split('.');
    const v = arr.splice(-2, 1);
    crc32Versions[arr.join('.')] = v[0];
    cb();
  })));

gulp.task('static:img', ['copy:others'], () => {
  const maxSize = 10 * 1024;

  const sizeLimit = (file, encoding, cb) => {
    if (file.stat.size > maxSize) {
      const size = Math.ceil(file.stat.size / 1024);
      console.error(`Warning, the size of ${file.path} is ${size}KB`);
    }
    cb(null, file);
  };

  return gulp.src([
    'build/**/*.png',
    'build/**/*.jpg',
    'build/**/*.gif',
    'build/**/*.ico',
  ])
  .pipe(through.obj(sizeLimit))
  .pipe(version())
  .pipe(gulp.dest(assetsPath));
});

gulp.task('crc32', ['static:css', 'static:js', 'static:img', 'static:webpack', 'static:webpack-version'], (cb) => {
  const data = {};
  const keys = _.keys(crc32Versions).sort();
  _.forEach(keys, (k) => {
    data[k] = crc32Versions[k];
  });
  fs.writeFile(path.join(__dirname, 'versions.json'), JSON.stringify(data, null, 2), cb);
});

gulp.task('default', [
  'del:assets',
  'del:build',
  'stylus',
  'copy:source',
  'copy:others',
  'static:css',
  'static:webpack',
  'static:js',
  'crc32',
  'clean',
]);

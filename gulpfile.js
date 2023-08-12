const { src, dest, series, parallel, task } = require('gulp');
const clean = require('gulp-clean');
const exec = require('child_process').exec;

task('clean', () => {
  return src('dist', { read: false, allowEmpty: true })
    .pipe(clean());
});

task('pkgroll', (cb) => {
  exec('pkgroll --sourcefile --env.NODE_ENV=production', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

task('tsc', (cb) => {
  exec('tsc --project tsconfig.migrations.json', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
});

task('move-docs', () => {
  return src('src/api/routes/v1/docs/*.yaml')
    .pipe(dest('dist/docs/v1'));
});

exports.build = series('clean', parallel('pkgroll', 'tsc', 'move-docs'))


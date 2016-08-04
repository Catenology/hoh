'use strict'
//dependencies
const gulp = require('gulp');
const del = require('del');
const util = require('gulp-util');
const zip = require('gulp-zip');
const ftp = require('vinyl-ftp');
const minimist = require('minimist');
const rename = require('gulp-rename');
const exec = require('child_process').exec;
const replace = require('gulp-replace');
const merge = require('merge-stream');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const download = require('gulp-download');

let deployargs = minimist(process.argv.slice(2));
let conn = ftp.create({
    host: deployargs.host,
    user: deployargs.user,
    password: deployargs.password,
    log: util.log
});
let timestamp = Math.round(Date.now() / 1000);

gulp.task('default', ['cachebust', 'zip']);

gulp.task('clean', () => {
    return del(['dist', 'src/css/_vendor', 'src/css/fonts', 'src/js/_vendor', 'src/css/vendor.min.css', 'src/js/vendor.min.js']);
});

gulp.task('zip', ['build'], () => {
    let fszip = gulp.src('dist/_site/**')
        .pipe(zip(`v${timestamp}.zip`))
        .pipe(gulp.dest('dist/_site/files'));
    return fszip;
});

gulp.task('build', ['scripts'], (cb) => {
    //jekyll build the site
    exec(['jekyll b --source src --destination dist/_site'], function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

//compile stylesheet
gulp.task('styles', ['download'], () => {
  let vendor = gulp.src(['src/css/_vendor/*.css'])
  .pipe(cleancss())
  .pipe(concat('vendor.min.css'))
  .pipe(gulp.dest('src/css'));
  let main = gulp.src(['src/css/*.css'])
  .pipe(cleancss())
  .pipe(concat('main.min.css'))
  .pipe(gulp.dest('src/css'));
  return merge(vendor, main);
});

//compile javascript
gulp.task('scripts', ['styles'], () => {
  let vendor = gulp.src(['src/js/_vendor/*.js'])
  .pipe(uglify())
  .pipe(concat('vendor.min.js'))
  .pipe(gulp.dest('src/js'));

  let main = gulp.src(['src/js/_main.js'])
  .pipe(babel({
      presets: ['es2015']
  }))
  .pipe(uglify())
  .pipe(rename('main.min.js'))
  .pipe(gulp.dest('src/js'));

  return merge(vendor, main);
});

gulp.task('download', ['clean'], () => {
    //catfw
    let catfwcss = download('http://catfw.catenology.com/files/catfw.min.css')
        .pipe(gulp.dest('src/css/_vendor/'));

    let catfwfonts = download(['http://catfw.catenology.com/files/fonts/catif.ttf', 'http://catfw.catenology.com/files/fonts/catif.woff', 'http://catfw.catenology.com/files/fonts/catif.eot', 'http://catfw.catenology.com/files/fonts/catif.svg'])
        .pipe(gulp.dest('src/css/fonts'));

    let catfwjs = download('http://catfw.catenology.com/files/catfw.min.js')
        .pipe(gulp.dest('src/js/_vendor/'));

    //jquery
    let jquery = download('https://code.jquery.com/jquery-3.1.0.min.js')
        .pipe(gulp.dest('src/js/_vendor/'));

    return merge(catfwcss, catfwjs, jquery);
});
//add timestamp to static assets to bust cache
gulp.task('cachebust', ['build'], () => {
    let fscachebust = gulp.src(['dist/_site/**/*.html', 'dist/_site/**/*.md', 'dist/_site/**/*.markdown'])
        .pipe(replace(/@@hash/g, timestamp))
        .pipe(gulp.dest('dist/_site'))
    return fscachebust;
});

//ftp deployment
gulp.task('deploy', ['cleanremote'], () => {
    let globs = ['dist/_site/**/*.*'];
    let fsdeploy = gulp.src(globs, {
            buffer: false
        })
        .pipe(conn.dest('.'));
    return fsdeploy;
})

//clean remote folder on ftp server
gulp.task('cleanremote', (cb) => {
    return conn.rmdir('.', function(err) {
        cb();
    });
});

gulp.task('imagemin', () => {
    gulp.src(['src/images/*', '_ux/*.{png,jpeg,svg}'])
        .pipe(imagemin())
        .pipe(gulp.dest('src/images'));
});

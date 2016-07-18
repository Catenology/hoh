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
const imagemin = require('gulp-imagemin');

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
    return del(['dist']);
});

gulp.task('zip', ['build'], () => {
    let fszip = gulp.src('dist/_site/**')
        .pipe(zip(`v${timestamp}.zip`))
        .pipe(gulp.dest('dist/_site/files'));
    return fszip;
});

gulp.task('build', ['clean'], (cb) => {
    //jekyll build the site
    exec(['jekyll b --source src --destination dist/_site'], function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
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
  let fsdeploy = gulp.src(globs, {buffer: false})
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
  gulp.src('src/images/*')
  .pipe(imagemin())
  .pipe(gulp.dest('src/images'));
});

'use strict'
//dependencies
const gulp = require('gulp');
const del = require('del');
const util = require('gulp-util');
const zip = require('gulp-zip');
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

let timestamp = Math.round(Date.now() / 1000);

gulp.task('default', ['cachebust', 'zip']);

//clean dynamiclly generated files
gulp.task('clean', () => {
    return del(['dist', 'src/_site', 'src/css/_vendor', 'src/css/fonts', 'src/js/_vendor', 'src/css/vendor.min.css', 'src/js/vendor.min.js']);
});

//make a zip file for distribution and backup
gulp.task('zip', ['build'], () => {
    let fszip = gulp.src('dist/_site/**')
        .pipe(zip(`v${timestamp}.zip`))
        .pipe(gulp.dest('dist/_site/files'));
    return fszip;
});

//jekyll build the site
gulp.task('build', ['scripts'], (cb) => {

    exec(['jekyll b --source src --destination dist/_site'], function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

//compile stylesheet
gulp.task('styles', ['libs'], () => {
    let vendor = gulp.src(['src/css/_vendor/*.css'])
        .pipe(cleancss())
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest('src/css'));
    return vendor;
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

gulp.task('libs', ['clean'], () => {
    //catfw
    let catfwcss = gulp.src('src/assets/catfw.min.css')
        .pipe(gulp.dest('src/css/_vendor/'));

    let catfwfonts = gulp.src(['src/assets/fonts/catif.ttf', 'src/assets/fonts/catif.woff', 'src/assets/fonts/catif.eot', 'src/assets/fonts/catif.svg'])
        .pipe(gulp.dest('src/css/fonts'));

    let catfwjs = gulp.src('src/assets/catfw.min.js')
        .pipe(gulp.dest('src/js/_vendor/'));

    //jquery
    let jquery = download('https://code.jquery.com/jquery-3.1.0.min.js')
        .pipe(gulp.dest('src/js/_vendor/'));
    let svg4everybody = download('https://raw.githubusercontent.com/jonathantneal/svg4everybody/master/dist/svg4everybody.min.js')
        .pipe(gulp.dest('src/js/_vendor/'));


    return merge(catfwcss, catfwjs, jquery, svg4everybody);
});

//add timestamp to static assets to bust cache
//not the best solution, will use MD5 later
gulp.task('cachebust', ['build'], () => {
    let fscachebust = gulp.src(['dist/_site/**/*.html', 'dist/_site/**/*.md', 'dist/_site/**/*.markdown'])
        .pipe(replace(/@@hash/g, timestamp))
        .pipe(gulp.dest('dist/_site'))
    return fscachebust;
});

//compress images
gulp.task('imagemin', () => {
    gulp.src(['src/images/*', '_ux/*.{png,jpeg,svg}'])
        .pipe(imagemin())
        .pipe(gulp.dest('src/images'));
});

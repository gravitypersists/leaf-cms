var fs = require("fs");
var gulp = require("gulp");
var gutil = require('gulp-util');
var s3 = require("gulp-s3");
var copy = require("gulp-copy");
var watchify = require('watchify');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
 
aws = JSON.parse(fs.readFileSync('./aws.json'));

gulp.task('sync', function(){
  gulp.src('./build/**')
    .pipe(s3(aws));
});

gulp.task('copy', function() {
  gulp.src(['index.html', 'assets/**'])
    .pipe(copy('./build'));
});

gulp.task('styles', function() {
  gulp.src('./styles/**/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  gulp.watch(['index.html', 'assets/**'], ['copy']);
  gulp.watch('styles/**/*.sass', ['styles']);
  gulp.start('copy', 'styles');
});


var bundler = watchify(browserify('./src/main.js', watchify.args));
bundler.transform('babelify');
bundler.on('update', bundle);
gulp.task('browserify', bundle);

function bundle() {
  var start = new Date().getTime();

  var b = bundler.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./build'));

  var end = new Date().getTime();
  var time = end - start;

  gutil.log('[browserify]', 'rebundle took ', gutil.colors.cyan(time + ' ms'));
  return b;
}

gulp.task('default', ['watch', 'browserify']);
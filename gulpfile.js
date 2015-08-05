var fs = require("fs");
var gulp = require("gulp");
var gutil = require('gulp-util');
var s3 = require("gulp-s3");
var watchify = require('watchify');
var babelify = require('babelify');
var babelify = require('reactify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var brfs = require('brfs');
var connect = require('gulp-connect');
 
aws = JSON.parse(fs.readFileSync('./aws.json'));
gulp.task('sync', function(){
  gulp.src('./build/**')
    .pipe(s3(aws));
});

gulp.task('copy', function() {
  gulp.src('index.html')
    .pipe(gulp.dest('./build'));
  gulp.src(['assets/**', 'submodules/leafbuilder/assets/**'])
    .pipe(gulp.dest('./build/assets'));
  gulp.src('./node_modules/font-awesome/**', { base: './node_modules/'})
    .pipe(gulp.dest('./build'));
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

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});


var bundler = watchify(browserify('./src/main.js', watchify.args));
bundler.transform('babelify');
bundler.transform('reactify');
bundler.transform(brfs);
bundler.on('update', bundle);
gulp.task('browserify', bundle);

function bundle() {
  var start = new Date().getTime();

  var b = bundler.bundle()
    .on('error', function(err) {
      gutil.beep();
      gutil.log(gutil.colors.red('Browserify error:'), gutil.colors.yellow(err.toString()));
    })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());

  var end = new Date().getTime();
  var time = end - start;

  gutil.log('[browserify]', 'rebundle took ', gutil.colors.cyan(time + ' ms'));
  return b;
}

gulp.task('default', ['connect', 'watch', 'browserify']);
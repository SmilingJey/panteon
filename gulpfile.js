'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var rename = require('gulp-rename');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var htmlinclude = require('posthtml-include');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var del = require('del');
var cheerio = require('gulp-cheerio');
var htmlmin = require('gulp-htmlmin');
var zip = require('gulp-zip');
var moment = require('moment');
var excludeGitignore = require('gulp-exclude-gitignore');
var log = require('fancy-log');

/************************** BUILD CSS **************************************/
gulp.task('css', function () {
  var processors = [autoprefixer({
    browsers: ['last 2 version']
  })];
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(csso())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

/************************** BUILD SVG **************************************/
gulp.task('svgclean', function () {
  return del('build/img/**/*.svg');
});

gulp.task('svgcopy', function () {
  return gulp.src([
      'source/img/**/*.svg',
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build/'));
});

gulp.task('svgmin', function () {
  return gulp.src('build/img/**/*.svg')
    .pipe(imagemin([
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

var svgSpriteImages = [];

gulp.task('svgsprite', function () {
  return gulp.src(svgSpriteImages)
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('svg', gulp.series('svgclean', 'svgcopy', 'svgmin', 'svgsprite'));

/************************** BUILD IMG **************************************/
gulp.task('imgcopy', function () {
  return gulp.src([
      'source/img/**/*.{png,jpg,gif,webp}',
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build/'));
});

gulp.task('imgmin', function () {
  return gulp.src('build/img/**/*.{png,jpg}')
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      })
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('webp', function () {
  return gulp.src('build/img/**/*.{png,jpg}')
    .pipe(webp({
      quality: 80
    }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('img', gulp.series('imgcopy', 'imgmin', 'webp'));

/************************** BUILD HTML **************************************/
gulp.task('html', function () {
  return gulp.src('source/**/*.html')
    .pipe(plumber())
    .pipe(posthtml([
      htmlinclude()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build/'));
});

/************************** BUILD JS ***************************************/
gulp.task('jsclean', function () {
  return del('build/js');
});

gulp.task('jscopy', function () {
  return gulp.src([
      'source/js/**'
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build/'));
});

var concatScripts = [
  'build/js/smooth-scroll.js',
  'build/js/slider.js'
];

gulp.task('jsconcat', function () {
  return gulp.src(concatScripts)
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('build/js/'));
});

gulp.task('jsmin', function () {
  return gulp.src(['build/js/**/*.js', '!build/js/**/*.min.js'])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('build/js/'));
});

gulp.task('js', gulp.series('jscopy', 'jsconcat', 'jsmin'));

/************************** BUILD FONT ***************************************/
gulp.task('fonts', function () {
  return gulp.src([
      'source/fonts/**/*.{woff,woff2}',
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build/'));
});

/**************************** CLEAN *****************************************/
gulp.task('clean', function () {
  return del('build');
});

gulp.task('clean-no-img', function () {
  return del(['build/**/*', '!build/img', '!build/img/**.*']);
});

/************************** LIVE RELOAD *************************************/
gulp.task('reloadPage', function (done) {
  server.reload();
  done();
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
    /*httpModule: 'http2',*/
    /*https: true,*/
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/**/*.html').on('change', gulp.series('html', 'reloadPage'));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('css'));
  gulp.watch('source/js/**/*.js').on('change', gulp.series('js', 'reloadPage'));
  gulp.watch('source/img/**/*.svg', gulp.series('svg', 'html', 'reloadPage'));
});

gulp.task('build', gulp.series('clean', 'fonts', 'img', /*'svg',*/ 'html', 'css', 'js'));
gulp.task('build-no-img', gulp.series('clean-no-img', 'fonts', /*'svg',*/ 'html', 'css', 'js'));
gulp.task('start', gulp.series('build-no-img', 'server'));

/************************** BACKUP *************************************/
gulp.task('backup', function () {
    var currentDate = moment().format('YYYY-MM-DD HH_mm');
    var folderName = __dirname.substring(__dirname.lastIndexOf('\\')+1);
    var backUpName = folderName + " " + currentDate + '.zip';
    var copyPath = 'd:/GoogleDrive/backup/';
    return gulp.src(['./*.*','source/**'], {base: './'})
        //.pipe(excludeGitignore())
        .pipe(zip(backUpName))
        .pipe(gulp.dest('backup/'))
        .pipe(gulp.dest(copyPath))
        .on('end', () => log('Backup done! File name ' + backUpName));
});

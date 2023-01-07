var gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
var concat = require('gulp-concat');
var maps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var server = require('browser-sync').create();
const critical = require('critical').stream;
const cleanCSS = require('gulp-clean-css');

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: 'web.out'
    }
  });
  done();
}


// compile sass to css
function css() {
  return gulp.src('tranmere-web/assets/scss/style.scss')
  .pipe(maps.init())
  .pipe(sass())
  .pipe(maps.write('./'))
  .pipe(gulp.dest('web.out/assets/css'))
  .pipe(server.stream());
}


// concatenate js files

function scripts() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
    'node_modules/owl.carousel/dist/owl.carousel.js',
    'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
    'node_modules/mustache/mustache.js',
    'node_modules/algoliasearch/dist/algoliasearch.js',
    'node_modules/autocomplete.js/dist/autocomplete.js',
    'node_modules/video.js/dist/video.js',
    'node_modules/videojs-youtube/dist/Youtube.js',
    'node_modules/amazon-cognito-auth-js/dist/amazon-cognito-auth.min.js',
    'tranmere-web/assets/js/modernizr.js'
    ])
    .pipe(maps.init())
    .pipe(concat('vendor.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('web.out/assets/js'));
}


// concatenate css files
function styles() {
  return gulp.src([
    'node_modules/owl.carousel/dist/assets/owl.carousel.css',
    'node_modules/magnific-popup/dist/magnific-popup.css',
    'node_modules/bootstrap-select/dist/css/bootstrap-select.css',
    'node_modules/video.js/dist/video-js.css'
    ])
    .pipe(maps.init({loadMaps: true}))
    .pipe(concat("vendor.css"))
    .pipe(maps.write())
    .pipe(gulp.dest('web.out/assets/css'));
}


// minify js
function minify() {
  return gulp.src('web.out/assets/js/vendor.js')
  .pipe(maps.init())
  .pipe(uglify())
  .pipe(rename('vendor.min.js'))
  .pipe(maps.write('./'))
  .pipe(gulp.dest('web.out/assets/js'));
}

function minifyCss() {
  return gulp.src('web.out/assets/css/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('web.out/assets/css'));
}

function criticalTask() {
 return gulp
    .src(['web.out/*.html'])
    .pipe(
      critical({
        base: 'web.out/',
        inline: true,
        dimensions: [
            {
              height: 500,
              width: 280,
            },
            {
              height: 900,
              width: 1200,
            }
        ]
      })
    )
    .pipe(gulp.dest('web.out'));
}


function static() {
    return gulp.src([
          './tranmere-web/data/*',
          './tranmere-web/favicon.ico',
          './tranmere-web/_headers',
          './tranmere-web/_redirects'],  {base: './tranmere-web/'})
      .pipe(gulp.dest('./web.out/'));
}

function publish() {
    return gulp.src([
          './tranmere-web/assets/fonts/*',
          './tranmere-web/assets/icons/*',
          './tranmere-web/assets/images/*',
          './tranmere-web/assets/logos/*',
          './tranmere-web/assets/players/*',
          './tranmere-web/assets/shirts/*',
          './tranmere-web/assets/templates/*',
          './tranmere-web/assets/js/*.js',
      ],  {base: './tranmere-web/assets/'})
      .pipe(gulp.dest('./web.out/assets/'));
}

// watch for changes
function watch() {
  gulp.watch('tranmere-web/assets/scss/**/*', gulp.series(css, criticalTask, reload));
  gulp.watch(['tranmere-web/assets/js/*'], gulp.series(publish, reload));
  gulp.watch(['tranmere-web/assets/templates/*'], gulp.series(publish, criticalTask, reload));
  gulp.watch('gulpfile.js', gulp.series(scripts, styles, minify, criticalTask, reload));
}


const build = gulp.series(static, publish, css, scripts, styles, minify, minifyCss, gulp.parallel(watch, serve));
const deploy = gulp.series(static, publish, css, scripts, styles, minify, minifyCss);

// tasks
exports.css = css;
exports.scripts = scripts;
exports.styles = styles;
exports.minify = minify;
exports.minifyCss = minifyCss;
exports.deploy = deploy;
exports.criticalTask = criticalTask;

exports.default = build;
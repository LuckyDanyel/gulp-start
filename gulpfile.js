const { src, dest, watch , parallel, series} = require('gulp');

const scss         = require('gulp-sass'); //В переменну scss закидывается вся супесила "gulp-sass"
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const dell         = require('del');
const del = require('del');

function browsersync(){
      browserSync.init({
            server: {
                  baseDir: 'app/'
            },
            notify: false
      })
}

function cleanDist(){
      return del('dist')
}

function scripts(){
      return src([
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js'
      ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
}

function images(){
      return src('app/images/**/*')
      .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
      ))
      .pipe(dest('dist/images'))
}

function styles() {
      return src('app/scss/style.scss')
            .pipe(scss({outputStyle: 'compressed'})) // Из scss в css и создание минифицировонного файла
            .pipe(concat('style.min.css')) //Добавление к названию файла 'style.min.css'
            .pipe(autoprefixer({
                  overrideBrowserslist: ['last 10 version'],
                  grid: true 
            }))
            .pipe(dest('app/css')) //Добавление в папку app/css
            .pipe(browserSync.stream()) //При обновлении scss файла происходит перезагрузка страницы
}

function build() {
      return src([
            'app/css/style.min.css',
            'app/fonts/**/*',
            'app/js/main.min.js',
            'app/*.html',
      ], {base: 'app'})
      .pipe(dest('dist'))
}

function watching() {
      watch(['app/scss/**/*.scss'], styles); //Следи за файлами scss и запускает функцию Styles(Конвертор)
      watch(['app/js/**/*.js','!app/js/main.min.js'], scripts); 
      watch(['app/*.html']).on('change', browserSync.reload); //Следит за обновлениями файла html и перезагружает страницу

}


exports.styles = styles;

exports.watching = watching; 

exports.browsersync = browsersync;

exports.scripts = scripts;

exports.images = images;

exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build); // Удаляет папку dist, сжимает картинки и делает билд проекта

exports.default = parallel(styles, scripts, browsersync , watching); // Default - запускает gulp. parrallel нужен для того чтобы запулскался и watching и сервер параллельно
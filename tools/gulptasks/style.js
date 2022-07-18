const gulp = require('gulp');
const sass = require('gulp-dart-sass');

gulp.task('style', () =>
  gulp
    .src('src/theme/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/css')),
);

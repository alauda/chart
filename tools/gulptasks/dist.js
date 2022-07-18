require('./build');
require('./style');
require('./clean');
const gulp = require('gulp');

gulp.task('dist', gulp.series(['clean', 'build', 'style']));

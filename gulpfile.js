const Gulp = require('gulp');
const GulpForwardReference = require('undertaker-forward-reference');

Gulp.registry(new GulpForwardReference());

(function (tasks) {
  tasks.forEach(gulpTask => require('./tools/gulptasks/' + gulpTask));
})(['clean', 'build', 'style', 'dist']);

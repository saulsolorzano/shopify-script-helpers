#! /usr/bin/env node

const gulp      = require('gulp'),
 path           = require('path'),
 os             = require('os'),
 sass           = require('gulp-sass'),
 postcss        = require('gulp-postcss'),
 uglify         = require('gulp-uglify'),
 browserify     = require('browserify'),
 autoprefixer   = require('autoprefixer'),
 t2             = require('through2'),
 source         = require('vinyl-source-stream'),
 babelify       = require('babelify'),
 buffer         = require('vinyl-buffer'),
 gulpStylelint  = require('gulp-stylelint'),
 eslint         = require('gulp-eslint'),
 glob           = require('glob'),
 es             = require('event-stream'),
 rename         = require('gulp-rename'),
 themeKit		= require('@shopify/themekit'),
 argv           = require('minimist')(process.argv.slice(2));


sass.compiler   = require('node-sass');

const paths = {
    'ssl': {
        cert: path.resolve(os.homedir(), '.localhost_ssl/server.crt'),
        key:  path.resolve(os.homedir(), '.localhost_ssl/server.key')
	},
	'styles': {
		src:  './styles/**/**/*.scss',
		main: './styles/theme.scss'
	},
	'scripts': {
		src:       './scripts/**/*.js',
		templates: './scripts/templates/*.js'
	}
};

/**
 * Función que asegura que el archivo se actualice
 * con fecha para que Themekit lo agare
 */
const touch = () => t2.obj( function( file, enc, cb ) {
	if ( file.stat ) {
		file.stat.atime = file.stat.mtime = file.stat.ctime = new Date();
	}
	cb( null, file );
});


// ESTILOS
function scssLint() {
	return gulp
		.src([paths.styles.src])
		.pipe(gulpStylelint({reporters: [{formatter: 'string', console: true}]}));
}
function scss() {
	return gulp.src(paths.styles.main)
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(postcss([autoprefixer()]))
		.pipe(touch())
		.pipe(gulp.dest('assets'));
}
// JAVASCRIPT
function jsLint() {
	return gulp
		.src(
			[paths.scripts.templates]
		)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

function js(done) {
	glob(paths.scripts.templates, function(err, files) {
		if (err) {
			done(err);
		};

		var tasks = files.map(function(entry) {
			return browserify({
				entries: [entry]
			})
			.transform(babelify.configure({
				presets: ['@babel/preset-env']
			}))
			.bundle()
			.pipe(source(entry))
			// Aquí sólo compilamos los templates
			// y le colocamos el prefijo
			// .template. para mejor targetearlos
			// con el liquid
			.pipe(rename({
				dirname: '',
				prefix:  'template.',
				extname: '.js'
			}))
			.pipe(buffer())
			.pipe(eslint())
			.pipe(uglify())
			.pipe(touch())
			.pipe(gulp.dest('assets'));
		});

		es.merge(tasks).on('end', done);

	});
	done();
}

function deployToShopify(cb) {
	const shopifyTheme = process.argv[2];
	themeKit.command('deploy', {
		allowLive: true,
		env: shopifyTheme
	});
	cb();
}

console.log('\x1b[34m%s\x1b[0m', `======================================`);
console.log('\x1b[34m%s\x1b[0m', `Deploy para ${process.argv[2]}`);
console.log('\x1b[34m%s\x1b[0m', `======================================`);

gulp.series(scssLint, scss, jsLint, js, deployToShopify)();

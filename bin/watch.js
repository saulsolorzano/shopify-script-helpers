#! /usr/bin/env node
const gulp      = require('gulp'),
 path           = require('path'),
 os             = require('os'),
 sass           = require('gulp-sass'),
 postcss        = require('gulp-postcss'),
 uglify         = require('gulp-uglify'),
 autoprefixer   = require('autoprefixer'),
 t2             = require('through2'),
 browserify     = require('browserify'),
 source         = require('vinyl-source-stream'),
 babelify       = require('babelify'),
 buffer         = require('vinyl-buffer'),
 browserSync    = require('browser-sync').create(),
 YAML           = require('yaml'),
 fs             = require('fs'),
 gulpStylelint  = require('gulp-stylelint'),
 eslint         = require('gulp-eslint'),
 glob           = require('glob'),
 es             = require('event-stream'),
 rename         = require('gulp-rename'),
 themeKit		= require('@shopify/themekit'),
 env            = process.argv[2];

console.log('\x1b[34m%s\x1b[0m', `======================================`);
console.log('\x1b[34m%s\x1b[0m', `Empezando watcher para ${env}`);
console.log('\x1b[34m%s\x1b[0m', `======================================`);

sass.compiler   = require('node-sass');

const browserConfig = {
	dev:       true,
	delayTime: 1500
};
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
	},
	'liquid': {
		src:       './{layout,templates}/**/*.liquid',
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

/**
 * Función que nos sirve para leer el archivo de configuración
 * de Shopify que necesitamos para ThemeKit
 */
function readConfig() {
	const file = fs.readFileSync('./config.yml', 'utf8');
	return YAML.parse(file);
}

// ESTILOS
function scssLint() {
	return gulp
		.src([paths.styles.src])
		.pipe(gulpStylelint({reporters: [{formatter: 'string', console: true}]}));
}
function scss() {
	return gulp.src(paths.styles.main)
		.pipe(sass())
		.pipe(postcss([autoprefixer()]))
		.pipe(touch())
		.pipe(gulp.dest('assets'))
		.pipe(browserSync.stream({once: true}));
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
			.pipe(gulp.dest('assets'))
			.pipe(browserSync.stream({once: true}));
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
function watch(cb) {
	const config = readConfig();
	const shopifyTheme = process.argv[2];

	themeKit.command('watch', {
		allowLive: true,
		env: shopifyTheme,
		notify: '/tmp/theme.update'
	});

	browserSync.init({
		proxy: `https://${config[shopifyTheme].store}?preview_theme_id=${config[shopifyTheme].theme_id}`,
		files: '/tmp/theme.update',
		https: {
			key:  paths.ssl.key,
			cert: paths.ssl.cert
		},
		injectChanges: true,
		reloadDelay:   browserConfig.delayTime,
		snippetOptions: {
			rule: {
				match: /<\/body>/i,
				fn:    function(snippet, match) {
					return snippet + match;
				}
			}
		}
	});
	
	gulp.watch(paths.styles.src, gulp.series(scssLint, scss));
	gulp.watch(paths.scripts.src, gulp.series(jsLint, js));
	gulp.watch(paths.liquid.src, gulp.series(deployToShopify));
	cb();
}
gulp.series(jsLint, js, scssLint, scss, watch)();

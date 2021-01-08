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
 browserSync    = require('browser-sync').create()
 YAML           = require('yaml'),
 fs             = require('fs'),
 gulpStylelint  = require('gulp-stylelint'),
 eslint         = require('gulp-eslint'),
 glob           = require('glob'),
 es             = require('event-stream'),
 rename         = require('gulp-rename'),
 argv           = require('minimist')(process.argv.slice(2));

sass.compiler   = require('node-sass');

const config = {
	dev:       true,
	delayTime: 1200
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
	}
};

function setProductionEnvironment(cb) {
	config.dev = !config.dev;
	cb();
}

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
		.pipe(sass(config.dev ? {outputStyle: 'compressed'} : ''))
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
			.pipe(gulp.dest('assets'))
			.pipe(browserSync.stream({once: true}));
		});

		es.merge(tasks).on('end', done);

	});
	done();
}

function watch() {
	const config = readConfig();
	const shopifyTheme = argv.theme;
	browserSync.init({
		proxy: `https://${config[shopifyTheme].store}?preview_theme_id=${config[shopifyTheme].theme_id}`,
		files: '/var/tmp/theme_ready',
		https: {
			key:  paths.ssl.key,
			cert: paths.ssl.cert
		},
		reloadDelay:    config.delayTime,
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
}


exports.watch = gulp.series(jsLint, js, scssLint, scss, watch);
exports.production = gulp.series(setProductionEnvironment, scssLint, scss, jsLint, js);

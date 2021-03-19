# Shopify Script Helpers 
Scripts for watching and deploying Shopify themes.

This package is meant to provide a development flow for working locally with Shopify using Theme Kit.

## Installing
You have to have [gulp-cli](https://www.npmjs.com/package/gulp-cli) and [theme kit](https://shopify.dev/tools/theme-kit) installed.

1. If you don't have a `package.json` file you need to create one using `npm init`.
2. This package uses a lot of dependencies, you need to run this command:

```bash
npx install-peerdeps --dev shopify-script-helpers
```
3. Check you `package.json` to see the gazillion dependencies installed.
4. Update your `package.json` to add the two scripts this packages provides:

```json
"scripts": {
    "watch": "shopify-watch",
		"deploy": "shopify-deploy"
},
```

## Using the package

Let's say that your `config.yml` is like this

```yaml
production:
  password: 111111212324343sds345asda
  theme_id: "123"
  store: your-store.myshopify.com
  ignore_files:
    - config/settings_data.json
    - locales/es-CL.default.json

dev:
  password: 29834723984sdfjdsfs122
  theme_id: "234"
  store: your-dev-store.myshopify.com
  ignore_files:
    - config/settings_data.json
    - locales/es-CL.default.json
```

You can run the command like this

```shell
npm run deploy production
```
or

```shell
npm run watch dev
```

Please if you have any errors, report.

***

Paquete para trabajar localmente con Shopify. Trabaja en conjunto con Gulp-cli y Theme Kit, los cuales deberás instalar

## Instalación
Tienes que tener [gulp-cli](https://www.npmjs.com/package/gulp-cli) y [theme kit](https://shopify.dev/tools/theme-kit) instalados.

1. Si no tienes un archivo `package.json` lo puedes crear usando `npm init`.
2. Este paquete usa muchas dependencias, así que la mejor manera de instalarlo es usando este comando:

```bash
npx install-peerdeps --dev shopify-script-helpers
```
3. Revisa tu `package.json` y verás las mil dependencias instaladas.
4. Actualiza tu `package.json` Para agregar dos scripts adicionales que provee este paquete:

```json
"scripts": {
    "watch": "shopify-watch",
		"deploy": "shopify-deploy"
},
```

## Usando este paquete

Recuerda que para usar theme kit necesitas un `config.yml`, supongamos que tiene esta estructura:

```yaml
production:
  password: 111111212324343sds345asda
  theme_id: "123"
  store: your-store.myshopify.com
  ignore_files:
    - config/settings_data.json
    - locales/es-CL.default.json

dev:
  password: 29834723984sdfjdsfs122
  theme_id: "234"
  store: your-dev-store.myshopify.com
  ignore_files:
    - config/settings_data.json
    - locales/es-CL.default.json
```

Puedes correr comandos así:

```shell
npm run deploy production
```
or

```shell
npm run watch dev
```

Si ves algún error, por favor, abre un issue.
# Shopify Script Helpers 
Scripts for watching and deploying Shopify themes.

This package is meant to provide a development flow for working locally with Shopify using Theme Kit.

You have to install all the dependencies yourself using.

```shell 
npm install --save-dev gulp node-sass gulp-sass gulp-postcss gulp-uglify stylelint stylelint-scss gulp-stylelint gulp-eslint gulp-rename autoprefixer through2 browserify vinyl-source-stream babelify vinyl-buffer browser-sync yaml glob event-stream minimist @babel/core @babel/preset-env
```
And then you need to add the following scripts to your `package.json`

```json
"scripts": {
    "watch": "script-helpers-watch",
    "deploy": "script-helpers-deploy"
},
```

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
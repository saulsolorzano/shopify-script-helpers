#! /usr/bin/env node
const shell 		= require("shelljs");
const theme			= process.argv.splice(2, process.argv.length - 2)[0];
shell.exec(`theme watch --env=${theme} --notify=/var/tmp/theme_ready --allow-live`);


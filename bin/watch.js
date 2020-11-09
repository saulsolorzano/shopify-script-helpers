#! /usr/bin/env node
const shell 		= require("shelljs");
const theme			= process.argv.splice(2, process.argv.length - 2)[0];
console.log('\x1b[34m%s\x1b[0m', `======================================`);
console.log('\x1b[34m%s\x1b[0m', `Empezando watcher para ${theme}`);
console.log('\x1b[34m%s\x1b[0m', `======================================`);
shell.exec(`theme watch --env=${theme} --notify=/var/tmp/theme_ready --allow-live`);


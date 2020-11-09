#! /usr/bin/env node
const shell 		= require("shelljs");
const theme			= process.argv.splice(2, process.argv.length - 2)[0];
console.log('\x1b[34m%s\x1b[0m', `======================================`);
console.log('\x1b[34m%s\x1b[0m', `Compilando para producción del tema ${theme}`);
console.log('\x1b[34m%s\x1b[0m', `======================================`);
shell.exec("gulp prod");
console.log('\x1b[34m%s\x1b[0m', `======================================`);
console.log('\x1b[34m%s\x1b[0m', 'Archivos compilados ✅ \nEmpezando a subir 🚀')
console.log('\x1b[34m%s\x1b[0m', `======================================`);
shell.exec(`theme deploy --env=${theme} --allow-live`);
console.log('\x1b[32m%s\x1b[0m', `======================================`);
console.log('\x1b[32m%s\x1b[0m', '¡¡¡¡Deploy exitoso!!!! 🥳')
console.log('\x1b[32m%s\x1b[0m', `======================================`);
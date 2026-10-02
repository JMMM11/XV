import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = path => readFile(new URL(path,root));
const names={html:'index.html',css:'estilos.css',experienceCSS:'experiencia.css',dataJS:'datos.js',appJS:'app.js',experienceJS:'experiencia.js',qrJS:'qrcode.js'};
const source={assets:{}};
for(const [key,path]of Object.entries(names))source[key]=(await read(path)).toString('utf8');
let licenses='';
for(const file of ['LICENSE-cormorant.txt','LICENSE-montserrat.txt','LICENSE-pinyon.txt']) {
  try { licenses+='/* '+file+'\n'+(await read('assets/fonts/'+file)).toString('utf8').replace(/\*\//g,'* /')+'\n*/\n'; } catch { /* legacy copies can still be packaged */ }
}
source.css=licenses+source.css+'\n'+source.experienceCSS;delete source.experienceCSS;
for(const [path,mime]of [
  ['assets/salon-regency.png','image/png'],['assets/detalles-del-baile.png','image/png'],['assets/favicon.svg','image/svg+xml'],
  ['assets/jardin-glicinas.png','image/png'],['assets/escalera-del-debut.png','image/png'],['assets/te-de-la-temporada.png','image/png'],
  ['assets/fonts/cormorant.woff2','font/woff2'],['assets/fonts/cormorant-italic.woff2','font/woff2'],['assets/fonts/montserrat.woff2','font/woff2'],['assets/fonts/pinyon.ttf','font/ttf']
]) source.assets[path]='data:'+mime+';base64,'+(await read(path)).toString('base64');
await writeFile(new URL('paquete.js',root),'/* Recursos para descargar la invitación sin conexión. Regenerar con node crear-paquete.mjs. */\nwindow.INVITATION_SOURCE='+JSON.stringify(source).replace(/</g,'\\u003c')+';\n');
console.log('Paquete creado: entrada, jardín, estilos, scripts, 5 imágenes y 4 recursos tipográficos incluidos.');

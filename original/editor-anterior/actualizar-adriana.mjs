import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('datos.js','utf8');
const box={window:{},location:{href:'http://localhost/'}};
vm.runInNewContext(source,box);
const d=box.window.EVENTO_BASE;
Object.assign(d,{
  nombre:'Adriana',nombreCelebracion:'Adriana Victoria',nombreCompleto:'Adriana Victoria Pinzón Jaén',iniciales:'AV',
  fechaISO:'2026-11-14T20:00:00-05:00',fechaFinISO:'2026-11-15T03:00:00-05:00',
  fechaTexto:'14 de noviembre de 2026',horaTexto:'8:00 p. m. — 3:00 a. m.',
  gaceta:'Dearest Gentle Reader… Esta temporada, la sociedad tiene una cita muy especial: los quince años de Adriana Victoria Pinzón Jaén. Entre valses, jardines y luces de salón, una nueva historia está por comenzar. Tu presencia será parte de sus páginas más queridas.'
});
d.retrato.alt='Retrato de Adriana Victoria Pinzón Jaén';
d.lugar={nombre:'Summit Rainforest & Golf Resort',salon:'',direccion:'Panamá',googleMaps:'https://www.google.com/maps/search/?api=1&query=Summit%20Rainforest%20%26%20Golf%20Resort',waze:'https://waze.com/ul?q=Summit%20Rainforest%20%26%20Golf%20Resort&navigate=yes',mapaConsulta:'Summit Rainforest & Golf Resort Panama',notaImagen:'El espíritu del baile · Imagen de ambientación'};
d.itinerario=[
 {hora:'8:00 p. m.',titulo:'Recepción de invitados',detalle:'Las puertas se abren para ti.',icono:'recepcion'},
 {hora:'9:00 p. m.',titulo:'Bienvenida',detalle:'Un brindis por esta gran noche.',icono:'brindis'},
 {hora:'10:00 p. m.',titulo:'Presentación oficial',detalle:'El vals de Adriana Victoria.',icono:'vals'},
 {hora:'11:00 p. m.',titulo:'Evento principal',detalle:'La protagonista de esta temporada.',icono:'vestido'},
 {hora:'12:00 a. m.',titulo:'Cena',detalle:'Compartimos la mesa y los recuerdos.',icono:'cena'},
 {hora:'1:00 a. m.',titulo:'Fiesta',detalle:'Música y baile hasta las 3:00 a. m.',icono:'violin'}
];
d.vestimenta={titulo:'Semi-formal',damas:'Un toque de elegancia',caballeros:'Un toque de elegancia',nota:'Los colores rosado y azul están reservados para Adriana. Te agradecemos evitar estos colores en tu vestimenta.'};
d.regalos.mensaje='Tu presencia es el regalo más especial. Si deseas tener un detalle con Adriana, tendremos lluvia de sobres.';
Object.assign(d.rsvp,{fechaLimite:'',whatsapp:'',titulo:'Confirmar tu\nasistencia',etiquetaMensaje:'Una nota para los anfitriones (opcional)',boton:'Confirmar asistencia',mensajeGracias:'Gracias por acompañar a Adriana en esta nueva temporada.'});
Object.assign(d.textos,{muroTitulo:'Palabras para\nAdriana',muroVacio:'Un deseo, un recuerdo, unas palabras que siempre pueda volver a leer.',muroEtiqueta:'EL LIBRO PRIVADO DE LOS BUENOS DESEOS',footerTema:'LOS XV DE ADRIANA · EN EL UNIVERSO DE BRIDGERTON',gacetaTitulo:'Adriana Victoria,\nel diamante de la temporada.',calendario:'Guardar la fecha',veladaSubtitulo:'Una crónica de nuestra gran noche.',placeholderMensaje:'Una nota para los anfitriones…'});
for(const key of ['relojEtiqueta','relojTitulo','relojFinal','dias','horas','minutos','segundos','masMensajes'])delete d.textos[key];
delete d.supabase;
const helper=`
// Esta invitación es única. Ignora configuraciones de antiguas vistas locales.
window.PUBLIC_MODE = true;
window.EVENTO_BASE.rsvp.whatsapp = window.CONFIGURACION_ADRIANA?.whatsapp || '';
window.InvitationData = (() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  function safeURL(value, media = false) {
    const str = String(value || '').trim();
    if (!str || /[\\u0000-\\u001F]/.test(str)) return '';
    if (media && /^data:(?:image\\/(?:png|jpeg|webp|gif|svg\\+xml)|audio\\/[a-z0-9.+-]+);base64,/i.test(str)) return str;
    if (media && str.startsWith('blob:')) return str;
    try { const url = new URL(str, location.href); if (['https:', 'http:'].includes(url.protocol)) return str; if (media && url.protocol === 'file:' && !/^[a-z][a-z0-9+.-]*:/i.test(str)) return str; } catch {}
    return '';
  }
  return {clone,safeURL,load:()=>clone(window.EVENTO_BASE),loadAsync:async()=>clone(window.EVENTO_BASE)};
})();
`;
await writeFile('datos.js','/* Contenido exclusivo de Adriana Victoria Pinzón Jaén. */\nwindow.EVENTO_BASE = '+JSON.stringify(d,null,2)+';\n'+helper);

let html=await readFile('index.html','utf8');
html=html.replaceAll('Emma Victoria','Adriana Victoria Pinzón Jaén').replaceAll('>EV<','>AV<');
html=html.replace(/(<b data-value=")nombreCompleto/g,'$1nombreCelebracion');
html=html.replace('class="hero-name" data-value="nombreCompleto"','class="hero-name" data-value="nombreCelebracion"');
html=html.replace('<p class="hero-intro"','<p class="hero-family">Pinzón Jaén</p><p class="hero-intro"');
html=html.replace('<p class="hero-subtitle"','<img class="bridgerton-mark" src="assets/decoracion/logo-bridgerton.png" alt="Bridgerton" width="1254" height="1254"><p class="hero-subtitle"');
html=html.replace('<span class="tiny-diamond"></span><span data-text="heroEtiqueta">','<img class="bee-detail hero-bee" src="assets/decoracion/abeja.png" alt="" width="1316" height="1195"><span data-text="heroEtiqueta">');
html=html.replace('<svg class="petal-emblem"><use href="#i-petals"/></svg>','<img class="bee-detail gazette-bee" src="assets/decoracion/abeja.png" alt="" loading="lazy" width="1316" height="1195">');
html=html.replace('<span data-value="lugar.nombre"></span> · <span data-value="lugar.salon"></span>','<span data-value="lugar.nombre"></span>');
html=html.replace(/<section class="countdown-section"[\s\S]*?<\/section>/,`<section class="celebration section-pad" id="celebracion" aria-labelledby="celebrationTitle"><div class="celebration-frame reveal"><img class="celebration-candle candle-left" src="assets/decoracion/candelabro.png" alt="" loading="lazy" width="1374" height="1145"><img class="celebration-candle candle-right" src="assets/decoracion/candelabro.png" alt="" loading="lazy" width="1374" height="1145"><p class="eyebrow">UNA CITA EN EL SALÓN DE ADRIANA</p><h2 id="celebrationTitle">La celebración</h2><span class="ornamental-divider" aria-hidden="true">❦</span><time class="celebration-date" datetime="2026-11-14">14 DE NOVIEMBRE DE 2026</time><p class="celebration-time">8:00 P. M. — 3:00 A. M.</p><p class="celebration-venue" data-value="lugar.nombre"></p><button class="text-link" id="calendarButton"><svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg><span data-text="calendario"></span></button></div></section>`);
html=html.replace('<svg class="evening-diamond" aria-hidden="true"><use href="#i-diamond"/></svg>','<img class="evening-flower" src="assets/decoracion/flor.png" alt="" loading="lazy" width="509" height="800">');
html=html.replace('<dl class="dress-people">','<dl class="dress-people" hidden>');
html=html.replace(/<section class="message-book[\s\S]*?<\/section>/,`<section class="message-book section-pad" id="palabras" aria-labelledby="messagesTitle"><div class="message-book-heading reveal"><p class="eyebrow" data-text="muroEtiqueta"></p><h2 id="messagesTitle" data-text="muroTitulo"></h2><p class="message-invitation" data-text="muroVacio"></p><img class="bee-detail message-bee" src="assets/decoracion/abeja.png" alt="" loading="lazy" width="1316" height="1195"><p class="message-privacy">Solo Adriana y su familia podrán leer tus palabras.</p></div><div class="private-letter reveal"><div class="letter-ornament" aria-hidden="true">❦</div><form id="privateMessageForm" novalidate><div class="field"><label for="messageText">Déjale unas palabras a Adriana</label><textarea id="messageText" name="mensaje" rows="5" maxlength="2000" placeholder="Escribe tu mensaje…" required aria-describedby="messageTextError"></textarea><p class="field-error" id="messageTextError" hidden>Escribe un mensaje de al menos 2 caracteres.</p></div><div class="field"><label for="messageName">Tu nombre</label><input id="messageName" name="nombre" autocomplete="name" maxlength="120" placeholder="Con cariño, de…" required aria-describedby="messageNameError"><p class="field-error" id="messageNameError" hidden>Escribe tu nombre (al menos 2 caracteres).</p></div><button class="button button-ink" type="submit" id="sendMessage"><span>Enviar mensaje</span><svg class="icon" aria-hidden="true"><use href="#i-quill"/></svg></button><p class="form-note" id="messageAvailability"></p><p class="field-error" id="messageSendError" role="alert" hidden></p></form><div class="message-success" id="messageSuccess" role="status" hidden><div class="message-wax" aria-hidden="true">AV</div><h3>Tus palabras han sido guardadas para Adriana.</h3><p>Gracias por escribir una página de su historia.</p></div></div></section>`);
html=html.replace(/<a href="editor.html" data-editor-link>[\s\S]*?<\/a>/,'');
html=html.replace('<script src="datos.js"></script>','<script src="configuracion.js"></script><script src="datos.js"></script><script src="servicios.js"></script>');
// Dibujos originales de línea, inspirados en la cronología aportada.
const icons={
 recepcion:'<path d="M22 23c-9 2-12 9-12 18v15h8l-2 27m16-27 3 27M20 40l11 7 11-5M20 24v18m14-17 6 13"/><circle cx="23" cy="14" r="7"/><path d="M59 24c-8 2-12 9-12 17v14h8l-5 27m17-27 6 27M60 26l9 25 8 7M52 41l-10 2"/><circle cx="60" cy="15" r="7"/>',
 brindis:'<path d="m22 10-6 22c-4 16 24 20 25 5l2-24-21-3ZM18 26l23 3M27 46l-4 30m-10 3 23 2M56 13l8 24c5 15 30 4 21-11L73 7l-17 6Zm4 15 21-8M74 45l9 27m-4 7 15-8M44 6l4-4 4 4m-4-4v12"/>',
 vals:'<circle cx="36" cy="14" r="7"/><circle cx="62" cy="14" r="7"/><path d="M31 24c-14 1-13 11-18 17l18 2 12-9m-7-10 15 18 21-1M27 43l-12 26 19 8 9-31m-7 29-5 13m15-49 8 26 21 14m-19-18-8 28M64 24l14 14 10-14M59 24l-8 12M71 42l-9 11"/>',
 vestido:'<path d="M43 8c-11 1-12 10-7 16l-11 8 10 5-6 14C18 57 9 75 7 85c18 7 67 6 86-2-11-20-17-30-31-32l-7-17 9-7-10-9M42 24l13-6M36 38l19-4M31 49c11 4 21 5 31 2M40 50 31 83m20-31 4 35m7-28 17 25M33 11l-5 8m27 3 14 22"/>',
 cena:'<circle cx="47" cy="47" r="32"/><circle cx="47" cy="47" r="24"/><path d="M47 30c-15 0-18 14-5 20 14 6 28-5 18-17M40 54l-8 13m20-16 9 15M4 15v20c0 8 9 8 9 0V15M8 15v68M88 15v68m0-68c12 10 11 31 0 33"/>',
 violin:'<path d="M59 9 37 64M65 10 44 67M55 22c-14-5-16 9-13 16-15-3-24 8-19 18-11 2-12 15-4 20 4 9 17 7 19-3 11 6 22-4 19-19 7 3 20-1 15-13M60 41 46 35M37 67l8-11M25 51l-3 5m25 4-2 5M83 9 59 84M55 7l9 5 6-10"/><circle cx="67" cy="5" r="4"/>'
};
html=html.replace('</svg>\n\n  <nav', '</svg>\n\n  <nav');
const symbols=Object.entries(icons).map(([id,paths])=>`<symbol id="agenda-${id}" viewBox="0 0 100 100">${paths}</symbol>`).join('\n');
const svgEnd=html.indexOf('</svg>',html.indexOf('<svg class="symbol-library"'));
html=html.slice(0,svgEnd)+symbols+html.slice(svgEnd);
await writeFile('index.html',html);

let app=await readFile('app.js','utf8');
app=app.replace("const preview = params.get('preview') === '1' && window.parent !== window;","const preview = false;");
app=app.replace("gallerySignature = '', messages = [], messageLimit = 3, ownResponse", "gallerySignature = '', ownResponse");
app=app.replace(/function backendEnabled\(\) \{[^\n]+\}/,"function backendEnabled() { return window.AdrianaServicios.available(); }");
app=app.replace('renderGallery(); updateCountdown(); renderPersonal();','renderGallery(); renderPersonal(); renderMessageAvailability();');
app=app.replace("      li.append(numeral,time,details);return li;",`      const drawing = document.createElementNS('http://www.w3.org/2000/svg','svg');
      drawing.classList.add('timeline-drawing');drawing.setAttribute('aria-hidden','true');drawing.setAttribute('viewBox','0 0 100 100');
      const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#agenda-'+item.icono);drawing.append(use);
      li.append(drawing,numeral,time,details);return li;`);
app=app.replace(/  function updateCountdown\(\) \{[\s\S]*?\n  function renderPersonal/, '  function renderPersonal');
app=app.replace(/  async function backendRequest\([\s\S]*?\n  async function loadPersonal/, '  async function loadPersonal');
app=app.replace(/    if\(invitation.familia&&backendEnabled\(\)&&!preview\) \{[\s\S]*?\n    \}\n    renderPersonal/, '    renderPersonal');
app=app.replace(/        const \{fecha,remote,[\s\S]*?record.remote=true;/, '        await window.AdrianaServicios.attendance(record);record.remote=true;');
app=app.replace("if(record.remote){toast('Tu respuesta quedó guardada.');await loadMessages();}","if(record.remote)toast('Tu respuesta quedó guardada.');");
app=app.replace(/  async function loadMessages\(\) \{[\s\S]*?\n  function foldICS/, `  let messageAttempt = null;
  function renderMessageAvailability() {
    $('#messageAvailability').textContent = backendEnabled() ? 'Tus palabras se enviarán de forma privada a Adriana.' : 'El libro de mensajes abrirá próximamente.';
  }
  async function submitPrivateMessage(event) {
    event.preventDefault();
    const name=$('#messageName').value.trim(), text=$('#messageText').value.trim();
    const nameOK=name.length>=2&&name.length<=120, textOK=text.length>=2&&text.length<=2000;
    $('#messageNameError').hidden=nameOK;$('#messageTextError').hidden=textOK;
    $('#messageName').setAttribute('aria-invalid',String(!nameOK));$('#messageText').setAttribute('aria-invalid',String(!textOK));
    if(!textOK){$('#messageText').focus();return;}if(!nameOK){$('#messageName').focus();return;}
    const error=$('#messageSendError');error.hidden=true;
    if(!backendEnabled()){error.textContent='El libro de mensajes aún no está abierto. Conserva tus palabras y vuelve pronto.';error.hidden=false;return;}
    const button=$('#sendMessage');if(button.disabled)return;
    if(!messageAttempt||messageAttempt.name!==name||messageAttempt.text!==text)messageAttempt={id:crypto.randomUUID(),name,text};
    button.disabled=true;button.querySelector('span').textContent='Guardando tus palabras…';
    try {
      await window.AdrianaServicios.message(name,text,messageAttempt.id);
      $('#privateMessageForm').hidden=true;$('#messageSuccess').hidden=false;
      $('#messageSuccess').scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
    } catch {
      error.textContent='No pudimos guardar tus palabras. Tu texto sigue aquí; revisa tu conexión e inténtalo de nuevo.';error.hidden=false;
    } finally {button.disabled=false;button.querySelector('span').textContent='Enviar mensaje';}
  }
  function foldICS`);
app=app.replace("$('#moreMessages').addEventListener('click',()=>{messageLimit+=6;renderMessages();});", "$('#privateMessageForm').addEventListener('submit',submitPrivateMessage);");
app=app.replace(/  window.addEventListener\('storage'[\s\S]*?\n  render\(\);observeReveals\(\);loadPersonal\(\);loadMessages\(\);setInterval\(updateCountdown,1000\);/, '  render();observeReveals();loadPersonal();');
app=app.replaceAll('desde el editor','en la configuración').replaceAll('al editor','a la configuración').replaceAll('mi-gran-debut.ics','adriana-victoria.ics').replaceAll('El Gran Debut','Adriana Victoria');
await writeFile('app.js',app);
let experience=await readFile('experiencia.js','utf8');
experience=experience.replace("const preview=new URLSearchParams(location.search).get('preview')==='1'&&parent!==window;",'const preview=false;');
experience=experience.replace(/  if\(preview\)window.addEventListener\('message',[^\n]+\n/,'');
await writeFile('experiencia.js',experience);
let css=await readFile('experiencia.css','utf8');
css=css.replace('--rose:#eee0df','--rose:#f8d7e7').replace('--sage:#e1e7da','--sage:#e3e8dc').replace('--blue:#e4e8dd','--blue:#e3e8dc');
css=css.replace('background:linear-gradient(125deg,#f0e4df,#eee4dd 65%,#e7e8dc)','background:linear-gradient(125deg,#f8d7e7,#f6e7e9 65%,#e3e8dc)');
await writeFile('experiencia.css',css);
await writeFile('assets/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#e3e8dc"/><circle cx="40" cy="40" r="34" fill="none" stroke="#b88a9f"/><text x="40" y="51" text-anchor="middle" font-family="Georgia,serif" font-size="31" fill="#3d493e">AV</text></svg>');
console.log('Página exclusiva de Adriana actualizada.');

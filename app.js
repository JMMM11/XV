(async () => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const D = window.InvitationData;
  window.INVITATION_CONFIG_READY = D.loadAsync();
  let data = await window.INVITATION_CONFIG_READY;
  const params = new URLSearchParams(location.search);
  const preview = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let invitation = { puestos: null, familia: params.get('f') || params.get('familia') || '', saludo: params.get('para') || '' };
  let galleryIndex = 0, lightboxIndex = 0, gallerySignature = '', ownResponse = null, toastTimer;
  let musicPlaying = false, ytPlayer = null, ytLoading = false;
  let heroIndex = 0, heroSignature = '', heroTimer, heroPaused = reduced, heroHover = false, heroFocus = false;
  const readPath = (obj, path) => path.split('.').reduce((v, key) => v?.[key], obj);
  function node(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
  function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4500); }
  function eventKey() { return 'bridgerton.respuesta.' + encodeURIComponent(data.nombreCompleto + '|' + data.fechaISO + '|' + invitation.familia); }
  function phoneNumber() { return data.rsvp.whatsapp.replace(/[\s()+-]/g, ''); }
  function validPhone() { return /^[1-9]\d{7,14}$/.test(phoneNumber()); }
  function backendEnabled() { return window.AdrianaServicios.available(); }
  function setImage(id, source, alt, position) {
    const img = $(id); if (!img) return;
    const url = D.safeURL(source, true);
    img.alt = alt || 'Fotografía de la celebración'; img.style.objectPosition = /^\d{1,3}% \d{1,3}%$/.test(position || '') ? position : '50% 50%';
    img.onload = () => { img.hidden = false; img.closest('figure')?.classList.remove('image-missing'); };
    img.onerror = () => { img.hidden = true; img.closest('figure')?.classList.add('image-missing'); };
    if (url) { if (img.getAttribute('src') !== url) { img.hidden = false; img.src = url; } }
    else { img.removeAttribute('src'); img.hidden = true; img.closest('figure')?.classList.add('image-missing'); }
  }
  function render() {
    $$('[data-text]').forEach(el => { el.textContent = data.textos[el.dataset.text] ?? ''; });
    $$('[data-value]').forEach(el => { el.textContent = readPath(data, el.dataset.value) ?? ''; });
    $$('[data-monogram]').forEach(el => {
      const url = D.safeURL(data.imagenes.monograma, true);
      el.replaceChildren();
      if (url) { const img = node('img'); img.src = url; img.alt = data.iniciales; el.append(img); }
      else el.textContent = data.iniciales;
    });
    document.title = `${data.textos.heroLinea1} ${data.textos.heroLinea2} · ${data.nombreCompleto}`;
    $('meta[name="description"]').content = `${data.nombreCompleto} · ${data.fechaTexto}. ${data.textos.heroFrase}`;
    $('meta[property="og:title"]').content = document.title;
    $('meta[property="og:description"]').content = `${data.fechaTexto} · ${data.lugar.nombre}. ${data.textos.heroFrase}`;
    renderHeroCarousel();
    const portrait = D.safeURL(data.retrato.archivo, true);
    $('#portraitFrame').dataset.hasPortrait = String(!!portrait); $('#portraitPlaceholder').hidden = !!portrait;
    setImage('#storyImage', portrait || data.imagenes.historia, portrait ? data.retrato.alt : data.imagenes.historiaAlt, portrait ? data.retrato.posicion : data.imagenes.historiaPosicion);
    [['#venueImage','lugar'],['#dressImage','vestimenta']].forEach(([id,key]) => setImage(id, data.imagenes[key], data.imagenes[key+'Alt'], data.imagenes[key+'Posicion']));
    $('#letterText').textContent = data.carta;
    $('#dressNote').textContent = data.vestimenta.nota; $('#dressNote').hidden = !data.vestimenta.nota;
    $('#deadline').textContent = data.rsvp.fechaLimite ? `Agradeceremos tu respuesta antes del ${data.rsvp.fechaLimite}.` : '';
    $('#guestName').placeholder = data.textos.placeholderNombre;
    $('#guestSong').placeholder = data.textos.placeholderCancion;
    $('#guestMessage').placeholder = data.textos.placeholderMensaje;
    for (const [id, value] of [['#mapsLink', data.lugar.googleMaps], ['#wazeLink', data.lugar.waze]]) { const a = $(id), url = D.safeURL(value); a.hidden = !url; if (url) a.href = url; else a.removeAttribute('href'); }
    const map=$('#mapContainer iframe');if(map){const src=`https://maps.google.com/maps?q=${encodeURIComponent(data.lugar.mapaConsulta || data.lugar.direccion)}&output=embed`;if(map.src!==src)map.src=src;}
    $('#formNote').textContent = backendEnabled() ? 'Tu respuesta se guardará en la lista de invitados.' : 'Tu respuesta se preparará para enviar por WhatsApp.';
    renderTimeline(); renderGifts(); renderGallery(); renderPersonal(); renderMessageAvailability();
    $('#musicToggle').hidden = !D.safeURL(data.musica.archivo, true) && !/^[\w-]{11}$/.test(data.musica.youtube);
    $('#musicToggle').title = data.musica.titulo;
    if (window.PUBLIC_MODE) $$('[data-editor-link]').forEach(el => el.remove());
    if (ownResponse) showResponse(ownResponse, false);
    window.InvitationContext = { config: data, preview };
    window.dispatchEvent(new CustomEvent('invitation:render', {detail: window.InvitationContext}));
  }
  function renderHeroCarousel() {
    const extras = data.carruselPortada.fotos;
    const photos = [{ archivo: data.imagenes.portada, alt: data.imagenes.portadaAlt, posicion: data.imagenes.portadaPosicion }, ...Array.from({length:4}, (_, i) => extras[i] || window.EVENTO_BASE.carruselPortada.fotos[i])];
    const signature = JSON.stringify([photos, data.carruselPortada.segundos]);
    if (signature === heroSignature) return;
    heroSignature = signature;
    const viewport = $('#heroSlides'), firstImage = $('#heroImage');
    viewport.replaceChildren(); $('#heroDots').replaceChildren();
    photos.forEach((photo, index) => {
      const slide = node('div', 'hero-slide'); slide.setAttribute('role', 'group'); slide.setAttribute('aria-roledescription', 'diapositiva'); slide.setAttribute('aria-label', `${index+1} de ${photos.length}`);
      const img = index === 0 && firstImage ? firstImage : node('img');
      if (index === 0) img.id = 'heroImage';
      img.alt = photo.alt || `Fotografía de portada ${index+1}`; img.width = 1122; img.height = 1402;
      img.style.objectPosition = /^\d{1,3}% \d{1,3}%$/.test(photo.posicion || '') ? photo.posicion : '50% 50%';
      img.fetchPriority = index === 0 ? 'high' : 'low'; img.decoding = 'async';
      img.onload = () => { img.hidden = false; slide.classList.remove('image-missing'); };
      img.onerror = () => { img.hidden = true; slide.classList.add('image-missing'); };
      const source = D.safeURL(photo.archivo, true);
      if (source) { img.hidden = false; if (img.getAttribute('src') !== source) img.src = source; }
      else { img.removeAttribute('src'); img.hidden = true; slide.classList.add('image-missing'); }
      slide.append(img); viewport.append(slide);
      const button = node('button', 'hero-dot'); button.type = 'button'; button.setAttribute('aria-label', `Ver fotografía ${index+1} de ${photos.length}`); button.setAttribute('aria-controls', 'heroSlides');
      button.addEventListener('click', () => showHeroSlide(index)); $('#heroDots').append(button);
    });
    $('#heroCarouselControls').hidden = false;
    showHeroSlide(Math.min(heroIndex, photos.length-1));
  }
  function showHeroSlide(index) {
    const slides = [...$('#heroSlides').children]; if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === heroIndex); slide.setAttribute('aria-hidden', String(i !== heroIndex)); });
    [...$('#heroDots').children].forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === heroIndex)));
    $('#heroPhotoIndex').textContent = ['I.', 'II.', 'III.', 'IV.', 'V.'][heroIndex];
    $('#heroSlides').dataset.index = String(heroIndex);
    scheduleHeroCarousel();
  }
  function scheduleHeroCarousel() {
    clearTimeout(heroTimer);
    const button = $('#heroCarouselPause');
    button.setAttribute('aria-label', heroPaused ? 'Reproducir carrusel' : 'Pausar carrusel'); button.title = button.getAttribute('aria-label');
    button.innerHTML = heroPaused ? '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 5 10 7-10 7Z"/></svg>' : '<svg class="icon" aria-hidden="true"><use href="#i-pause"/></svg>';
    $('#heroSlides').setAttribute('aria-live', heroPaused || heroHover || heroFocus ? 'polite' : 'off');
    if (heroPaused || heroHover || heroFocus || document.hidden || $('#arrivalDialog')?.open) return;
    const seconds = Math.max(3, Math.min(15, Number(data.carruselPortada.segundos) || 5));
    heroTimer = setTimeout(() => showHeroSlide(heroIndex + 1), seconds * 1000);
  }
  $('#heroCarouselPause').addEventListener('click', () => {
    heroPaused = !heroPaused;
    if (!heroPaused) { heroHover = false; heroFocus = false; }
    scheduleHeroCarousel();
  });
  $('#heroCarousel').addEventListener('mouseenter', () => { if (!matchMedia('(hover: hover)').matches) return; heroHover = true; scheduleHeroCarousel(); });
  $('#heroCarousel').addEventListener('mouseleave', () => { heroHover = false; scheduleHeroCarousel(); });
  $('#heroCarousel').addEventListener('focusin', () => { heroFocus = true; scheduleHeroCarousel(); });
  $('#heroCarousel').addEventListener('focusout', event => { heroFocus = $('#heroCarousel').contains(event.relatedTarget); scheduleHeroCarousel(); });
  document.addEventListener('visibilitychange', scheduleHeroCarousel);
  window.addEventListener('invitation:arrival-state', scheduleHeroCarousel);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches) heroPaused = true; scheduleHeroCarousel(); });
  let swipeStart;
  $('#heroSlides').addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    swipeStart = { x:event.clientX, y:event.clientY, id:event.pointerId };
    $('#heroSlides').setPointerCapture(event.pointerId);
  }, {passive:true});
  $('#heroSlides').addEventListener('pointerup', event => {
    if (!swipeStart || event.pointerId !== swipeStart.id) return;
    const dx=event.clientX-swipeStart.x, dy=event.clientY-swipeStart.y;swipeStart=null;
    if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.4) showHeroSlide(heroIndex+(dx<0?1:-1));
  }, {passive:true});
  $('#heroSlides').addEventListener('pointercancel', () => { swipeStart=null; }, {passive:true});
  function renderTimeline() {
    $('#timeline').replaceChildren(...data.itinerario.map(item => {
      const li = node('li');
      const time = node('time', '', item.hora); const details = node('div'); details.append(node('h3','',item.titulo)); if(item.detalle) details.append(node('p','',item.detalle));
      const source = D.safeURL(item.imagen, true);
      if (source) {
        const image = node('img','timeline-photo');image.alt = item.imagenAlt || '';image.loading = 'lazy';image.decoding = 'async';
        image.onerror = () => { image.remove();li.classList.remove('has-image'); };
        image.src = source;li.classList.add('has-image');li.append(image);
      }
      li.append(time,details);return li;
    }));
  }
  function renderGifts() {
    $('#giftEnvelopes').hidden = !data.regalos.lluviaDeSobres;
    const bank = $('#bankDetails'); bank.replaceChildren(); bank.hidden = !data.regalos.cuenta;
    if (data.regalos.cuenta) {
      for (const value of [data.regalos.banco, data.regalos.cuenta, data.regalos.titular]) if (value) bank.append(node('p','',value));
      const button = node('button','text-link',data.textos.copiarCuenta);button.type = 'button';
      button.addEventListener('click',async () => { try { await navigator.clipboard.writeText(data.regalos.cuenta);toast('Número de cuenta copiado.'); } catch { toast(`Número de cuenta: ${data.regalos.cuenta}`); } });bank.append(button);
    }
    $('#giftStores').replaceChildren();
    data.regalos.tiendas.forEach(store => { const url = D.safeURL(store.url);if(!url)return;const a=node('a','text-link',store.nombre);a.href=url;a.target='_blank';a.rel='noopener noreferrer';$('#giftStores').append(a); });
  }
  function renderGallery() {
    const signature = JSON.stringify(data.fotos);if(signature===gallerySignature)return;gallerySignature=signature;
    const track=$('#galleryTrack');track.replaceChildren();
    data.fotos.forEach((photo,index) => {
      const fig=node('figure','gallery-photo reveal');const btn=node('button');btn.type='button';btn.setAttribute('aria-label',`Ampliar fotografía ${index+1}: ${photo.texto || photo.alt || ''}`);btn.dataset.photo=String(index);
      const img=node('img');img.loading='lazy';img.alt=photo.alt || photo.texto || `Fotografía ${index+1}`;img.style.objectPosition=photo.posicion || '50% 50%';const url=D.safeURL(photo.archivo,true);
      if(url)img.src=url;else fig.classList.add('image-missing');img.onerror=()=>{img.hidden=true;fig.classList.add('image-missing');};btn.append(img);
      const caption=node('figcaption');caption.append(node('span','',String(index+1).padStart(2,'0')),node('span','',photo.texto || ''));fig.append(btn,caption);track.append(fig);
    });
    $('#galeria').hidden = !data.fotos.length;galleryIndex=0;requestAnimationFrame(updateGalleryCounter);
    $('#lightboxPrev').hidden = $('#lightboxNext').hidden = data.fotos.length < 2;
  }
  function updateGalleryCounter() {
    const count=data.fotos.length;
    const track=$('#galleryTrack');$('#galleryControls').hidden = count < 2 || track.scrollWidth <= track.clientWidth + 2;
    $('#galleryCounter').textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`;
    $('#galleryPrev').disabled=galleryIndex<=0;$('#galleryNext').disabled=galleryIndex>=count-1;
  }
  function moveGallery(direction) { const track=$('#galleryTrack');galleryIndex=Math.max(0,Math.min(data.fotos.length-1,galleryIndex+direction));const photo=track.children[galleryIndex];if(photo)track.scrollTo({left:photo.offsetLeft-track.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft),behavior:reduced?'instant':'smooth'});updateGalleryCounter(); }
  function openPhoto(index) {
    if(!data.fotos.length)return;lightboxIndex=(index+data.fotos.length)%data.fotos.length;const photo=data.fotos[lightboxIndex];
    const img=$('#lightboxImage');img.src=D.safeURL(photo.archivo,true);img.alt=photo.alt || photo.texto || '';$('#lightboxCaption').textContent=photo.texto;
    if(!$('#lightbox').open)$('#lightbox').showModal();
  }
  function renderPersonal() {
    const greeting=$('#personalGreeting');greeting.hidden=!invitation.saludo;greeting.textContent=`${data.textos.saludo} ${invitation.saludo}`;
    $('#reservedSeats').hidden=!invitation.puestos;$('#seatNumber').textContent=invitation.puestos || '';
  }
  function renderCompanions() {
    const container=$('#companions');container.replaceChildren();
    if(!(invitation.puestos>1))return;
    for(let i=1;i<invitation.puestos;i++) { const field=node('div','field companion-field');const label=node('label','',`Nombre del acompañante ${i} (opcional)`);const input=node('input');input.id=`companion${i}`;input.name=`companion${i}`;input.maxLength=120;label.htmlFor=input.id;field.append(label,input);container.append(field); }
  }
  async function loadPersonal() {
    const seat=Number(params.get('p') || params.get('puestos'));if(Number.isInteger(seat)&&seat>=1&&seat<=99)invitation.puestos=seat;
    renderPersonal();renderCompanions();
    if(!preview) { try { const response=JSON.parse(localStorage.getItem(eventKey()));if(response&&response.nombre&&['si','no'].includes(response.asiste)) { ownResponse=response;showResponse(response,false); } } catch { /* optional browser storage */ } }
  }
  function codeFor(name) {
    const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=new Uint8Array(6);crypto.getRandomValues(bytes);
    return (data.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase() || 'XV')+'-'+[...bytes].map(x=>letters[x%letters.length]).join('');
  }
  function whatsappMessage(record) {
    let text=`Hola, soy ${record.nombre}. ${record.asiste==='si'?'Confirmo mi asistencia':'Lamento no poder asistir'} a los XV de ${data.nombreCompleto}.\n${data.fechaTexto} · ${data.horaTexto}\n${data.lugar.nombre}${data.lugar.salon?' · '+data.lugar.salon:''}`;
    if(record.familia)text+='\nInvitación: '+record.familia;
    if(record.puestos)text+='\nLugares reservados: '+record.puestos;
    if(record.acompanantes?.length)text+='\nAcompañantes: '+record.acompanantes.join(', ');
    if(record.cancion)text+='\nCanción: '+record.cancion;
    if(record.mensaje)text+='\nMi mensaje: '+record.mensaje;
    if(record.remote&&record.asiste==='si')text+='\nCódigo del pase: '+record.codigo;
    return text;
  }
  function showResponse(record, scroll=true) {
    $('#rsvpForm').hidden=true;$('#responseCard').hidden=false;
    const seal=$('#acceptedSeal');seal.hidden=record.asiste!=='si';seal.classList.remove('is-stamped');
    if(!seal.hidden&&scroll){void seal.offsetWidth;seal.classList.add('is-stamped');}
    const confirmed=record.remote===true;
    $('#responseEyebrow').textContent=confirmed?'RESPUESTA GUARDADA':'TU CARTA ESTÁ PREPARADA';
    $('#responseTitle').textContent=confirmed?(record.asiste==='si'?'Nos vemos en el baile.':'Te vamos a extrañar.'):'Un último paso…';
    $('#responseGuest').textContent=record.nombre;
    $('#responseStatus').textContent=confirmed?data.rsvp.mensajeGracias:'Envía tu respuesta por WhatsApp para hacerla llegar a los anfitriones.';
    $('#passCode').hidden=!(confirmed&&record.asiste==='si');$('#passQr').hidden=!(confirmed&&record.asiste==='si');$('#passCode').textContent=record.codigo || '';
    $('#passQr').replaceChildren();
    if(confirmed&&record.asiste==='si'&&typeof qrcode==='function') { const qr=qrcode(0,'M');qr.addData(`${data.nombreCompleto} | ${record.codigo} | ${data.fechaTexto}`);qr.make();const img=node('img');img.src=qr.createDataURL(4,4);img.alt='QR del código de referencia del pase';$('#passQr').append(img); }
    const link=$('#whatsappLink');link.hidden=!validPhone();$('#whatsappNote').hidden=!validPhone();
    if(validPhone())link.href=`https://wa.me/${phoneNumber()}?text=${encodeURIComponent(whatsappMessage(record))}`;else link.removeAttribute('href');
    $('#editResponse').hidden=confirmed;
    if(scroll)$('#responseCard').scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
  }
  async function submitResponse(event) {
    event.preventDefault();const form=$('#rsvpForm');const name=$('#guestName').value.trim();const choice=form.querySelector('input[name=asiste]:checked');
    $('#nameError').textContent=data.rsvp.errorNombre;$('#nameError').hidden=name.length>=3;$('#guestName').setAttribute('aria-invalid',String(name.length<3));
    $('#attendanceError').textContent=data.rsvp.errorAsiste;$('#attendanceError').hidden=!!choice;
    if(name.length<3) { $('#guestName').focus();return; }if(!choice) { form.querySelector('input[name=asiste]').focus();return; }
    if(preview) { toast('Vista previa: esta respuesta no se guarda ni se envía.');return; }
    if(!backendEnabled()&&!validPhone()) { $('#submitError').hidden=false;$('#submitError').textContent='Los anfitriones aún deben configurar el número de WhatsApp de esta invitación.';return; }
    const record={ nombre:name,asiste:choice.value,acompanantes:$$('.companion-field input').map(el=>el.value.trim()).filter(Boolean),familia:invitation.familia || null,puestos:invitation.puestos,cancion:$('#guestSong').value.trim(),mensaje:$('#guestMessage').value.trim(),codigo:codeFor(name),fecha:new Date().toISOString(),remote:false };
    const button=$('#submitRsvp');if(button.disabled)return;button.disabled=true;$('#submitError').hidden=true;
    try {
      if(backendEnabled()) {
        await window.AdrianaServicios.attendance(record);record.remote=true;
      }
      ownResponse=record;try{localStorage.setItem(eventKey(),JSON.stringify(record));}catch{toast('Tu navegador no pudo guardar la copia local. Puedes enviar la respuesta ahora.');}
      showResponse(record);if(record.remote)toast('Tu respuesta quedó guardada.');
    } catch(error) {
      $('#submitError').hidden=false;$('#submitError').textContent='No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.';
      if(validPhone()) { ownResponse=record;showResponse(record);$('#responseStatus').textContent='No pudimos guardar en la lista. Puedes hacer llegar tu respuesta por WhatsApp.'; }
    } finally { button.disabled=false; }
  }
  let messageAttempt = null;
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
  function setMusicState(playing) {
    musicPlaying=playing;const button=$('#musicToggle');button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?data.textos.sinMusica:data.textos.musica);button.querySelector('span').textContent=playing?data.textos.sinMusica:data.textos.musica;button.querySelector('use').setAttribute('href',playing?'#i-pause':'#i-music');
  }
  const eventAudio = $('#eventAudio');
  let musicStartPending = false;
  function prepareLocalMusic() {
    const file = D.safeURL(data.musica.archivo, true);
    if (!file) return false;
    if (eventAudio.getAttribute('src') !== file) eventAudio.src = file;
    eventAudio.volume = Math.min(1, Math.max(0, data.musica.volumen));
    return true;
  }
  function stopWaitingForFirstInteraction() {
    document.removeEventListener('click', musicOnInteraction, true);
    document.removeEventListener('keydown', musicOnInteraction, true);
  }
  async function tryStartMusic() {
    if (musicPlaying || musicStartPending || !prepareLocalMusic()) return;
    musicStartPending = true;
    try {
      await eventAudio.play();
      setMusicState(true);
      stopWaitingForFirstInteraction();
    } catch {
      // Algunos navegadores exigen un gesto: se vuelve a intentar al primer toque o tecla.
    } finally {
      musicStartPending = false;
    }
  }
  function musicOnInteraction(event) {
    if (event.target.closest?.('#musicToggle')) return;
    void tryStartMusic();
  }
  async function toggleMusic() {
    if(preview)return;
    const audio=$('#eventAudio');const file=D.safeURL(data.musica.archivo,true);
    if(file) {
      if(musicPlaying){audio.pause();setMusicState(false);return;}
      if(audio.getAttribute('src')!==file)audio.src=file;audio.volume=Math.min(1,Math.max(0,data.musica.volumen));
      try{await audio.play();setMusicState(true);stopWaitingForFirstInteraction();}catch{setMusicState(false);toast('No se pudo reproducir la música. Revisa el archivo o inténtalo de nuevo.');}return;
    }
    if(ytPlayer){if(musicPlaying)ytPlayer.pauseVideo();else ytPlayer.playVideo();return;}
    if(ytLoading)return;ytLoading=true;toast('Preparando la música…');
    try {
      if(!window.YT?.Player)await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('YouTube no disponible')),12000);window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);resolve();};const script=node('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timer);reject(new Error('Sin conexión'));};document.head.append(script);});
      $('#youtubeAudio').hidden=false;const holder=node('div');holder.id='ytEventPlayer';$('#youtubeAudio').replaceChildren(holder);
      ytPlayer=new YT.Player('ytEventPlayer',{width:1,height:1,videoId:data.musica.youtube,playerVars:{autoplay:1,loop:1,playlist:data.musica.youtube,playsinline:1},events:{onReady:event=>{event.target.setVolume(Math.round(data.musica.volumen*100));event.target.playVideo();},onStateChange:event=>setMusicState(event.data===YT.PlayerState.PLAYING),onError:()=>{setMusicState(false);toast('La música de YouTube no está disponible. Puedes usar un MP3 en la configuración.');}}});
    } catch {toast('No se pudo cargar YouTube. Revisa tu conexión o añade un MP3 en la configuración.');}finally{ytLoading=false;}
  }
  let observer;
  function observeReveals() {
    if(reduced)return;document.body.classList.add('js-motion');observer ||= new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px 35px 0px'});$$('.reveal:not(.visible)').forEach(el=>observer.observe(el));
  }
  function openLetter() {
    if($('#letterDialog').open)return;$('#envelope').classList.add('opening');
    setTimeout(()=>{if(!$('#letterDialog').open)$('#letterDialog').showModal();},reduced?0:450);
  }
  function closeLetter() {$('#letterDialog').close();$('#envelope').classList.remove('opening');}
  $('#openLetter').addEventListener('click',openLetter);$('#openLetterText').addEventListener('click',openLetter);$('#closeLetter').addEventListener('click',closeLetter);
  $('#letterDialog').addEventListener('close',()=>$('#envelope').classList.remove('opening'));
  $('#letterRsvp').addEventListener('click',()=>{closeLetter();$('#confirmar').scrollIntoView({behavior:reduced?'instant':'smooth'});});
  for(const dialog of [$('#letterDialog'),$('#lightbox')])dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  $('#menuToggle').addEventListener('click',()=>{const open=$('#menuToggle').getAttribute('aria-expanded')==='true';$('#menuToggle').setAttribute('aria-expanded',String(!open));$('#menuToggle').setAttribute('aria-label',open?'Abrir menú':'Cerrar menú');$('#navLinks').classList.toggle('open',!open);});
  $('#navLinks').addEventListener('click',event=>{if(event.target.closest('a')){$('#navLinks').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label','Abrir menú');}});
  document.addEventListener('keydown',event=>{if($('#lightbox').open&&event.key==='ArrowRight')openPhoto(lightboxIndex+1);if($('#lightbox').open&&event.key==='ArrowLeft')openPhoto(lightboxIndex-1);if(event.key==='Escape'){$('#navLinks').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');}});
  $('#galleryTrack').addEventListener('click',event=>{const photo=event.target.closest('[data-photo]');if(photo)openPhoto(Number(photo.dataset.photo));});
  $('#galleryTrack').addEventListener('scroll',()=>{const track=$('#galleryTrack');const photos=[...track.children];if(!photos.length)return;let best=0,distance=Infinity;photos.forEach((el,i)=>{const diff=Math.abs(el.offsetLeft-track.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft)-track.scrollLeft);if(diff<distance){distance=diff;best=i;}});galleryIndex=best;updateGalleryCounter();},{passive:true});
  $('#galleryPrev').addEventListener('click',()=>moveGallery(-1));$('#galleryNext').addEventListener('click',()=>moveGallery(1));$('#lightboxPrev').addEventListener('click',()=>openPhoto(lightboxIndex-1));$('#lightboxNext').addEventListener('click',()=>openPhoto(lightboxIndex+1));$('#closeLightbox').addEventListener('click',()=>$('#lightbox').close());
  new ResizeObserver(updateGalleryCounter).observe($('#galleryTrack'));
  $('#mapToggle').addEventListener('click',()=>{const container=$('#mapContainer');const open=container.hidden;container.hidden=!open;$('#mapToggle').setAttribute('aria-expanded',String(open));if(open&&!container.children.length){const iframe=node('iframe');iframe.title='Mapa del lugar de la celebración';iframe.src=`https://maps.google.com/maps?q=${encodeURIComponent(data.lugar.mapaConsulta || data.lugar.direccion)}&output=embed`;iframe.loading='lazy';iframe.referrerPolicy='no-referrer';container.append(iframe);}});
  $('#rsvpForm').addEventListener('submit',submitResponse);
  $('#editResponse').addEventListener('click',()=>{if(!ownResponse)return;$('#guestName').value=ownResponse.nombre;$('#guestSong').value=ownResponse.cancion;$('#guestMessage').value=ownResponse.mensaje;$('#rsvpForm').querySelector(`input[value="${ownResponse.asiste}"]`).checked=true;$$('.companion-field input').forEach((el,i)=>el.value=ownResponse.acompanantes?.[i] || '');$('#responseCard').hidden=true;$('#rsvpForm').hidden=false;$('#guestName').focus();});
  $('#privateMessageForm').addEventListener('submit',submitPrivateMessage);
  document.addEventListener('click',musicOnInteraction,true);document.addEventListener('keydown',musicOnInteraction,true);
  eventAudio.addEventListener('play',()=>setMusicState(true));eventAudio.addEventListener('pause',()=>setMusicState(false));
  $('#musicToggle').addEventListener('click',toggleMusic);$('#eventAudio').addEventListener('error',()=>{setMusicState(false);toast('El archivo de música no está disponible.');});
  let ticking=false;
  window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.width=(max>0?Math.min(100,scrollY/max*100):0)+'%';ticking=false;});},{passive:true});
  render();observeReveals();loadPersonal();void tryStartMusic();
})();

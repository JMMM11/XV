/* Exportación sin servidor: los recursos se incluyen en paquete.js. */
window.InvitationExport = (() => {
  function inlineConfig(config, sources) {
    const copy = window.InvitationData.clone(config);
    const embed = value => sources.assets[value.replace(/^\.\//,'')] || value;
    for (const key of ['portada','historia','lugar','vestimenta','monograma']) {
      const value = copy.imagenes[key];
      if (value && !/^(?:https?:|data:)/i.test(value) && !sources.assets[value.replace(/^\.\//,'')]) throw new Error(`Sube la imagen de ${key} desde el editor para incluirla en la descarga.`);
      copy.imagenes[key] = embed(value);
    }
    if (copy.retrato.archivo && !/^(?:https?:|data:)/i.test(copy.retrato.archivo) && !sources.assets[copy.retrato.archivo.replace(/^\.\//,'')]) throw new Error('Sube el retrato desde el editor para incluirlo en la descarga.');
    copy.retrato.archivo = embed(copy.retrato.archivo);
    copy.carruselPortada.fotos.forEach((photo,index) => {
      if (photo.archivo && !/^(?:https?:|data:)/i.test(photo.archivo) && !sources.assets[photo.archivo.replace(/^\.\//,'')]) throw new Error(`Sube la foto ${index+2} del carrusel de portada para incluirla en la descarga.`);
      photo.archivo = embed(photo.archivo);
    });
    copy.fotos.forEach((photo,index) => {
      if (photo.archivo && !/^(?:https?:|data:)/i.test(photo.archivo) && !sources.assets[photo.archivo.replace(/^\.\//,'')]) throw new Error(`Sube la fotografía ${index+1} para incluirla en la descarga.`);
      photo.archivo = embed(photo.archivo);
    });
    if (copy.musica.archivo && !/^(?:https?:|data:)/i.test(copy.musica.archivo) && !sources.assets[copy.musica.archivo.replace(/^\.\//,'')]) throw new Error('Sube el MP3 desde el editor para incluirlo en la descarga.');
    copy.musica.archivo = embed(copy.musica.archivo);
    if (!copy.supabase.habilitado) { copy.supabase.url = ''; copy.supabase.clave = ''; }
    return copy;
  }
  function createHTML(config, sources = window.INVITATION_SOURCE) {
    if (!sources) throw new Error('No se cargó el paquete de la invitación. Recarga el editor.');
    const embedded = inlineConfig(config,sources);
    const media = {}, seen = new Map();
    function pack(value) {
      if (!/^data:(?:image|audio)\//i.test(value)) return value;
      if (!seen.has(value)) { const key='__INVITATION_MEDIA_'+seen.size+'__'; seen.set(value,key); media[key]=value; }
      return seen.get(value);
    }
    for (const key of ['portada','historia','lugar','vestimenta','monograma']) embedded.imagenes[key]=pack(embedded.imagenes[key]);
    embedded.carruselPortada.fotos.forEach(photo=>photo.archivo=pack(photo.archivo));
    embedded.retrato.archivo=pack(embedded.retrato.archivo);
    embedded.fotos.forEach(photo=>photo.archivo=pack(photo.archivo));
    embedded.musica.archivo=pack(embedded.musica.archivo);
    const doc = new DOMParser().parseFromString(sources.html,'text/html');
    doc.querySelectorAll('script,link[rel=stylesheet],link[rel=preload],[data-editor-link]').forEach(el=>el.remove());
    let css = sources.css;
    for (const [path,value] of Object.entries(sources.assets)) css=css.split(path).join(value);
    const style=doc.createElement('style');style.textContent=css;doc.head.append(style);
    const icon=doc.querySelector('link[rel=icon]');if(icon)icon.href=sources.assets['assets/favicon.svg'];
    doc.title=`${embedded.textos.heroLinea1} ${embedded.textos.heroLinea2} · ${embedded.nombreCompleto}`;
    doc.querySelector('meta[name=description]').content=`${embedded.nombreCompleto} · ${embedded.fechaTexto}. ${embedded.textos.heroFrase}`;
    doc.querySelector('meta[property="og:title"]').content=doc.title;
    doc.querySelector('meta[property="og:description"]').content=`${embedded.fechaTexto} · ${embedded.lugar.nombre}. ${embedded.textos.heroFrase}`;
    const read=(path)=>path.split('.').reduce((value,key)=>value?.[key],embedded);
    doc.querySelectorAll('[data-value]').forEach(el=>el.textContent=read(el.dataset.value)??'');
    doc.querySelectorAll('[data-text]').forEach(el=>el.textContent=embedded.textos[el.dataset.text]??'');
    doc.querySelectorAll('img[src]').forEach(img=>img.removeAttribute('src'));
    [['heroImage','portada'],['storyImage','historia'],['venueImage','lugar'],['dressImage','vestimenta']].forEach(([id,key])=>doc.getElementById(id).alt=embedded.imagenes[key+'Alt']);
    const json=JSON.stringify(embedded).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    const mediaJSON=JSON.stringify(media).replace(/</g,'\\u003c');
    const runtime=sources.dataJS+'\n;window.PUBLIC_MODE=true;window.EVENTO_BASE='+json+';\n'+
      '(()=>{const resources='+mediaJSON+';const urls={};for(const [key,value]of Object.entries(resources)){const parts=value.split(",");const raw=atob(parts[1]);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);urls[key]=URL.createObjectURL(new Blob([bytes],{type:parts[0].slice(5).split(";")[0]}));}const c=window.EVENTO_BASE;for(const key of ["portada","historia","lugar","vestimenta","monograma"])c.imagenes[key]=urls[c.imagenes[key]]||c.imagenes[key];c.retrato.archivo=urls[c.retrato.archivo]||c.retrato.archivo;for(const photo of [...c.fotos,...c.carruselPortada.fotos])photo.archivo=urls[photo.archivo]||photo.archivo;c.musica.archivo=urls[c.musica.archivo]||c.musica.archivo;})();';
    for(const [name,code] of [['datos-invitacion',runtime],['qr-invitacion',sources.qrJS],['experiencia-invitacion',sources.appJS],['jardin-invitacion',sources.experienceJS]]) { const script=doc.createElement('script');script.id=name;script.textContent=code.replace(/<\/script/gi,'<\\/script');doc.body.append(script); }
    return '<!doctype html>\n'+doc.documentElement.outerHTML;
  }
  function download(content,name,type='text/html;charset=utf-8') {
    const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
  }
  return { createHTML, inlineConfig, download };
})();

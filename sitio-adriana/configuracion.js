/* Configuración de la anfitriona. No crea opciones de edición en la página. */
window.CONFIGURACION_ADRIANA = {
  // Añade el número completo cuando lo tengas: '507XXXXXXXX'.
  // '+507' por sí solo no se utiliza como destino.
  whatsapp: '',
  // Imágenes del orden del baile: ruta local o enlace https.
  // Ejemplo: recepcion: 'assets/baile/recepcion.png'
  // Admite PNG, JPG, WebP y SVG. Vacío = solo la hora y el texto.
  imagenesBaile: {
    recepcion: '',
    bienvenida: '',
    presentacion: '',
    principal: '',
    cena: '',
    fiesta: ''
  },
  supabase: {
    // Después de ejecutar supabase/adriana.sql, pega estos dos valores.
    url: '', // https://TU-PROYECTO.supabase.co
    clavePublica: '' // sb_publishable_... (o la clave anon antigua)
  }
};

# La Gran Noche · Adriana Victoria Pinzón Jaén

Invitación exclusiva para el **14 de noviembre de 2026**, de **8:00 p. m. a 3:00 a. m.**, en **Summit Rainforest & Golf Resort**. Conserva la entrada palacio → sobre → carta, el jardín y el carrusel automático de cinco imágenes. No tiene editor para invitados ni contador regresivo.

## Ver la página

Desde esta carpeta, ejecuta `node servidor.mjs` y abre <http://127.0.0.1:4173/>. Los archivos de mantenimiento y las pruebas no se sirven a los visitantes. Node solo se utiliza para previsualizar: la invitación puede publicarse en un alojamiento de páginas estáticas.

## Número de WhatsApp pendiente

Abre **configuracion.js** y cambia únicamente `whatsapp: ''` por tu número completo, por ejemplo `whatsapp: '507XXXXXXXX'` usando los dígitos reales. El prefijo +507 solo no es un número válido. Este ajuste se realiza en el archivo; no aparece ningún panel de personalización en la invitación.

Si Supabase está conectado, las confirmaciones quedan almacenadas aunque aún no hayas añadido WhatsApp. Si solo configuras WhatsApp, la invitación prepara el mensaje y el invitado debe pulsar Enviar dentro de WhatsApp. La página distingue entre una respuesta preparada y una respuesta guardada por el servidor.

## Poner tus imágenes en el orden del baile

Guarda las imágenes que quieras usar en **assets/baile/**. En **configuracion.js**, completa `imagenesBaile` con sus rutas, por ejemplo:

```js
imagenesBaile: {
  recepcion: 'assets/baile/recepcion.png',
  bienvenida: 'assets/baile/bienvenida.jpg',
  presentacion: 'assets/baile/presentacion.png',
  principal: 'assets/baile/evento-principal.webp',
  cena: 'assets/baile/cena.png',
  fiesta: 'assets/baile/fiesta.png'
},
```

Usa los nombres y extensiones reales de tus archivos. También puedes pegar un enlace HTTPS a una imagen. Si dejas una ruta vacía, ese momento muestra únicamente la hora y el texto. Las imágenes se muestran completas, sin recortarlas. No hay dibujos de línea ni botones para personalizar la invitación en la página de los invitados.

Después de añadirlas, ejecuta `node publicar.mjs` y sube la carpeta actualizada. Si trabajas directamente en `sitio-adriana`, modifica su `configuracion.js` y añade las imágenes dentro de su propia carpeta `assets/baile`.

## Activar los mensajes privados en Supabase

La explicación para comenzar desde cero está en **[SUPABASE-PASO-A-PASO.md](SUPABASE-PASO-A-PASO.md)**: qué es, cómo crear el proyecto, dónde pegar el SQL, qué clave copiar y cómo leer las cartas.

1. Crea tu proyecto de Supabase y ejecuta **supabase/adriana.sql** completo en su SQL Editor.
2. En **configuracion.js**, pega la URL del proyecto en `supabase.url` y su clave **publishable** en `supabase.clavePublica`. También se admite la antigua clave pública `anon`. Usa únicamente una clave pública; las claves `sb_secret_...` y `service_role` no pertenecen a esta página.
3. Publica o vuelve a subir `configuracion.js`. La conexión se activa cuando ambos valores tienen un formato válido.
4. Envía una carta de prueba desde **Palabras para Adriana**. Comprueba que aparece en la tabla `mensajes_adriana` de tu proyecto.

El formulario envía realmente los mensajes a Supabase mediante su Data API. Muestra **“Tus palabras han sido guardadas para Adriana”** después de la respuesta correcta del servidor. Ante un error, conserva el texto y permite reintentar; no guarda las cartas privadas únicamente en el navegador ni publica mensajes de otras personas. Un reintento de la misma carta conserva su identificador para evitar duplicados.

**Estado inicial:** no se ha conectado ningún proyecto, siguiendo tu indicación de configurarlo después. El formulario indica que el libro abrirá próximamente y no simula un guardado. La confirmación de asistencia también necesita Supabase o un número de WhatsApp completo.

## Leer y recuperar las cartas

Adriana o su familia pueden entrar al proyecto de Supabase y abrir **Table Editor → mensajes_adriana**. Desde el SQL Editor también pueden ejecutar:

```sql
select nombre, mensaje, creado
from public.mensajes_adriana
order by creado desc;
```

La tabla `confirmaciones_adriana` conserva la lista de asistencia. Puedes consultar o exportar ambas tablas desde tu proyecto. Las reglas RLS y los permisos permiten a los visitantes **insertar**; les impiden leer, cambiar o borrar registros. No existe una contraseña administrativa ni una clave privilegiada en el sitio.

Referencias utilizadas: [claves de API de Supabase](https://supabase.com/docs/guides/getting-started/api-keys) y [permisos con Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Publicar

Ejecuta `node publicar.mjs`. Sube **solo el contenido de sitio-adriana/** a tu alojamiento (incluyendo toda la carpeta `assets`). `index.html` debe estar en la raíz del sitio. No publiques la carpeta completa de trabajo: contiene herramientas y pruebas que no forman parte de la invitación.

El ZIP **Adriana-Victoria.zip** contiene los mismos archivos de la invitación y se puede descomprimir para publicarlos. Si cambias el número o las claves en la carpeta de trabajo, vuelve a ejecutar `node publicar.mjs`; también puedes modificar directamente el `configuracion.js` del sitio publicado. El ZIP inicial tiene la conexión pendiente.

## Detalles de esta versión

- Paleta crema, dorado, **#f8d7e7** y **#e3e8dc**; ornamentación, abejas, candelabros y logo aportados por ti.
- Vestimenta **Semi-formal**. Rosado y azul reservados para Adriana; la solicitud de evitarlos está destacada.
- **Lluvia de sobres** y sección visible para confirmar asistencia.
- Orden del baile con los seis horarios de tu referencia y espacio para tus imágenes. Sus rutas se indican en `configuracion.js` y los horarios se pueden ajustar en `datos.js`.
- `retrato.archivo` queda vacío en `datos.js` hasta disponer de una fotografía real de Adriana; el marco muestra su monograma AV.
- Fotografías de ambientación: no son fotografías de Adriana ni del resort. Sus créditos están en `assets/CREDITOS.md`.
- Los enlaces al mapa y la música necesitan internet. La música se inicia al pulsar el botón. Las animaciones respetan la preferencia de movimiento reducido.
- La versión para teléfonos tiene texto ampliado, campos de al menos 16 px, botones táctiles grandes, menú desplegable y carrusel que se puede deslizar. La música se reduce a un botón pequeño y deja espacio al escribir en los formularios.
- La fecha aparece como información del evento, sin botón para guardarla en un calendario.

`qa/adriana.mjs` verifica esta versión en una instancia aislada de Chrome. La prueba de la integración utiliza respuestas controladas de la API y no envía cartas reales a ningún proyecto. El guardado en tu proyecto se comprueba al configurar Supabase siguiendo el paso 4.

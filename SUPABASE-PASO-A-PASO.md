# Conectar la invitación de Adriana a Supabase

Supabase es un servicio que mantiene una base de datos en internet. En esta invitación será el lugar donde se guardan los mensajes y las confirmaciones de todos los invitados, aunque cierren la página o entren desde teléfonos diferentes.

Puedes imaginar dos listas: **mensajes_adriana** guarda el nombre, las palabras y la fecha de cada carta; **confirmaciones_adriana** guarda quién asistirá y los datos de su respuesta. Tú las lees desde tu cuenta de Supabase. Los invitados escriben directamente en la invitación y no necesitan una cuenta.

La página y Supabase tienen funciones diferentes: el alojamiento muestra la invitación; Supabase conserva los datos enviados. Las fotos de esta versión siguen dentro de la carpeta `assets` de la página.

## 1. Crear el proyecto

1. Abre <https://supabase.com/dashboard> y crea tu cuenta o inicia sesión.
2. Pulsa **New project**. Si te pide una organización, crea una con el nombre que prefieras.
3. Escribe un nombre, por ejemplo **XV Adriana Victoria**.
4. Elige una contraseña para la base de datos y guárdala en un lugar privado. Esa contraseña no se pega en la invitación.
5. Elige una región cercana a tus invitados entre las disponibles y crea el proyecto. Espera a que termine de prepararse.

## 2. Crear las dos listas y sus permisos

1. En el proyecto, entra a **SQL Editor** y abre una consulta nueva.
2. Abre el archivo **supabase/adriana.sql** que está en esta carpeta.
3. Copia todo el contenido y pégalo en el SQL Editor.
4. Pulsa **Run** y comprueba que termina correctamente.

El archivo ya contiene la estructura de ambas tablas y sus reglas de privacidad. Los invitados pueden enviar una carta o una confirmación, pero no consultar, modificar ni borrar los registros. Mantén activada la opción RLS; no necesitas crear tablas a mano ni abrir permisos de lectura pública.

## 3. Obtener los dos datos para conectar la página

Abre **Connect** en tu proyecto y busca los datos de conexión para una aplicación web. Necesitas:

- **Project URL**: tiene la forma `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`.
- **Publishable key**: empieza por `sb_publishable_`. También se encuentra en **Settings → API Keys**.

La clave publishable está diseñada para la página pública; los permisos del paso 2 son los que protegen los mensajes. No uses una clave **secret** o **service_role**, ni la contraseña de la base de datos.

## 4. Pegarlos en la invitación

Abre **configuracion.js**. Busca el bloque `supabase` al final y sustituye solo los valores vacíos, conservando las comillas:

```js
supabase: {
  url: 'https://TU-PROYECTO.supabase.co',
  clavePublica: 'sb_publishable_TU_CLAVE_PUBLICA'
}
```

Ese ejemplo es ilustrativo: debes usar la URL y la clave completas de tu propio proyecto. Conserva el resto del archivo, incluyendo el número de WhatsApp y las imágenes del baile.

Guarda el archivo. Si estás viendo la página desde `node servidor.mjs`, recarga el navegador. Si ya publicaste la invitación, ejecuta `node publicar.mjs` y vuelve a subir el contenido actualizado de **sitio-adriana/**. También puedes modificar directamente `configuracion.js` en la copia que estés publicando.

## 5. Comprobar que se guarda de verdad

1. Abre la invitación y ve a **Palabras para Adriana**.
2. Escribe un nombre de prueba y un mensaje reconocible, por ejemplo “Prueba de conexión”.
3. Pulsa **Enviar mensaje**. Debe aparecer “Tus palabras han sido guardadas para Adriana”.
4. Vuelve a Supabase, abre **Table Editor → mensajes_adriana** y verifica que está esa fila.
5. Haz también una confirmación de prueba y comprueba **confirmaciones_adriana**.

Cuando encuentres ambas pruebas en las tablas, la conexión ya está funcionando. Puedes borrar esas filas de prueba desde tu propio panel. Hasta que añadas la conexión, el libro indica que abrirá próximamente y no presenta los mensajes como guardados.

## Leer las palabras más adelante

Entra a tu cuenta de Supabase y abre **Table Editor → mensajes_adriana**. Cada fila corresponde a una carta. En **confirmaciones_adriana** verás las respuestas de asistencia.

También puedes usar el SQL Editor para obtener las cartas más recientes primero:

```sql
select nombre, mensaje, creado
from public.mensajes_adriana
order by creado desc;
```

Los datos quedan en el proyecto, no en el teléfono del invitado. El sitio no muestra un muro público de mensajes. Para conservar una copia fuera de Supabase, exporta los resultados desde tu panel.

## WhatsApp

WhatsApp es independiente. Cuando tengas el número, completa `whatsapp` en `configuracion.js` con `507` seguido del número real, solo dígitos. Con Supabase conectado puedes recibir confirmaciones en la base de datos aunque ese número todavía esté vacío. Si usas únicamente WhatsApp, el invitado debe pulsar **Enviar** dentro de WhatsApp para hacerte llegar su respuesta.

## Si algo no funciona

- **Sigue diciendo que el libro abrirá próximamente:** comprueba que guardaste la URL y la clave pública completas, sin espacios, y que subiste la versión correcta de `configuracion.js`.
- **Dice que no pudo guardar:** comprueba la conexión a internet, que el proyecto está activo y que ejecutaste `supabase/adriana.sql` completo. El texto permanece en el formulario para volver a intentarlo.
- **No aparecen las tablas:** confirma que ejecutaste el SQL en el mismo proyecto del que copiaste la URL y la clave.
- **La consulta de los invitados no puede leer mensajes:** es el comportamiento previsto. La lectura se hace desde tu panel de Supabase.

Referencias oficiales: [bases de datos y tablas](https://supabase.com/docs/guides/database/tables), [claves públicas](https://supabase.com/docs/guides/getting-started/api-keys) y [permisos RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

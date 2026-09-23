# Casos Técnicos — Fase 1: Arquitectura

## ¿Qué es esto?

Esto NO es todavía la web terminada. Es el **esqueleto técnico** del
proyecto: la organización de carpetas, la conexión con la base de
datos y la "forma" de los datos (qué es un caso, una categoría, etc.).
Es la cañería antes de poner los muebles.

Falta a propósito:
- El diseño visual (colores, tipografías, imágenes) → Fase 2.
- El Home, los Servicios y las páginas de caso → Fases 3, 4 y 5.
- El panel de administración funcionando → Fase 7.

## ¿Qué hay dentro de cada carpeta?

- `app/` → cada subcarpeta es una página de la web (ej: `app/Servicios`
  es la página `tusitio.com/Servicios`). Hoy están vacías, listas
  para llenarse en las próximas fases.
- `components/` → piezas reutilizables (una tarjeta de caso, el menú,
  la galería). Organizadas por tema para no perdernos cuando crezca.
- `lib/supabase/` → el "cable" que conecta la web con la base de datos.
- `types/` → el diccionario de datos: define qué campos tiene un caso,
  una categoría, una etiqueta, etc. Todo el proyecto se apoya en esto.
- `supabase/schema.sql` → el plano de la base de datos. Este archivo
  se ejecuta UNA vez dentro de Supabase para crear todas las tablas.
- `.env.example` → plantilla de las claves de conexión (no lleva
  datos reales todavía, eso lo hacemos en la Fase 6).

## ¿Qué vas a tener que hacer vos, más adelante?

Nada todavía en esta fase. Cuando lleguemos a la Fase 6 (Base de
datos) y a la Fase 15 (Deploy), te voy a guiar paso a paso, con
capturas de qué botón apretar, para:
1. Crear una cuenta gratuita en Supabase y pegar el contenido de
   `supabase/schema.sql`.
2. Crear una cuenta en GitHub y en Vercel.
3. Conectar todo para que la web quede publicada en internet.

Por ahora, no hace falta que instales nada ni que ejecutes ningún
comando.

## Próximo paso

Fase 2: Diseño visual. Vamos a definir la identidad propia del
proyecto (paleta de color, tipografías, sistema de espaciado) —
inspirada conceptualmente en la experiencia de Constructum, pero
con una imagen 100% original.

---

## Fase 13: Accesibilidad

Esta sección documenta lo que se hizo en la Fase 13, sobre la base
del proyecto ya funcionando (Home, Servicios, caso individual, CMS,
galería, vídeo, búsqueda, filtros, SEO y performance ya estaban
resueltos en fases anteriores).

### ¿Qué es "accesibilidad" y por qué importa acá?

Significa que la web se pueda usar sin depender de una sola forma de
interactuar: con teclado en vez de mouse, con un lector de pantalla
(el software que usan las personas ciegas para que la computadora
"lea" la página en voz alta), con poco contraste de visión, o
prefiriendo poca animación en pantalla. No es un "extra": para una
Servicios técnica pensada para consultarse durante años, es parte
de que el producto sea profesional y no excluya usuarios.

### Qué se cambió

1. **Foco de teclado visible.** Antes, al navegar con la tecla Tab,
   muchos botones y campos no mostraban ningún indicador de "estás
   acá". Ahora cualquier elemento interactivo muestra un anillo
   dorado al recibir foco por teclado (no aparece al hacer clic con
   el mouse, para no ensuciar la interfaz visualmente).

2. **Enlace "Saltar al contenido".** Invisible hasta que alguien
   navega con teclado y llega a él apretando Tab una vez. Le evita
   tener que pasar por todo el menú (logo, Servicios, productos,
   buscador) en cada página antes de llegar al contenido real. Está
   en el sitio público y en `/admin`.

3. **Menú móvil y galería de fotos con "trampa de foco".** Al abrir
   el menú hamburguesa o el lightbox de una galería, el foco de
   teclado queda contenido adentro (no se "escapa" hacia el fondo de
   la página) y, al cerrar, vuelve exactamente al botón que lo abrió.

4. **Formularios del panel de administración conectados
   correctamente.** Las etiquetas de los campos (en "Nuevo caso" y en
   "Subir imagen o vídeo") ahora están asociadas a su campo en el
   código, no solo puestas cerca visualmente. Esto es lo que le
   permite a un lector de pantalla anunciar "Título, campo de texto"
   en vez de solo "campo de texto".

5. **Contraste de color corregido.** El azul usado en las etiquetas
   de normativa técnica medía 3.83:1 de contraste contra el fondo
   oscuro (la norma WCAG 2.2 AA exige 4.5:1 para texto de ese
   tamaño). Se aclaró levemente el tono para llegar a 6.48:1, sin
   cambiar la paleta general del sitio.

6. **Detalles menores:** el error de "email o contraseña incorrectos"
   ahora se anuncia solo a lectores de pantalla; se recuperó un
   aviso de "3 casos encontrados" en los filtros de los Servicios que
   se había perdido al reorganizar ese componente; los símbolos ← y
   → ya no se leen en voz alta como "flecha izquierda/derecha".

### Qué NO hace falta que hagas vos

Nada. Esta fase es enteramente de código: no requiere crear cuentas
ni tocar Supabase/Vercel. Si en algún momento querés comprobarlo con
tus propios ojos, alcanza con navegar la web usando solo el teclado
(Tab, Shift+Tab, Enter, Escape) y ver que siempre se entienda dónde
está el foco.

### Próximo paso

Fase 14: Seguridad. Vamos a revisar que el panel `/admin` esté bien
protegido, que ninguna clave sensible quede expuesta en el código
que llega al navegador, y que las subidas de archivos tengan
validaciones (tipo y tamaño) antes de guardarse.

---

## Fase 14: Seguridad

### Qué se cambió

1. **Cada acción del panel vuelve a verificar la sesión, por las
   dudas.** El middleware ya bloqueaba entrar a `/admin` sin haber
   iniciado sesión, pero eso solo protege la *navegación* (ver una
   página). Guardar un caso, subir un archivo o borrar algo es, en
   los hechos, un pedido aparte al servidor. Ahora cada una de esas
   acciones (`createCase`, `uploadMedia`, `deleteCase`, etc.) vuelve
   a comprobar por sí misma que hay una sesión válida antes de tocar
   la base de datos. Es una precaución extra, no dependemos de una
   sola verificación.

2. **Los archivos subidos ahora se revisan de verdad.** Antes se
   guardaba cualquier archivo con su nombre y "tipo" tal cual los
   mandaba el formulario. Ahora el servidor:
   - Verifica el tipo real del archivo (no lo que diga un menú
     desplegable): solo acepta JPG, PNG, WEBP, GIF, AVIF para
     imágenes, y MP4, WEBM, MOV para vídeo. Cualquier otra cosa
     (por ejemplo, un archivo `.html` disfrazado de foto) se
     rechaza.
   - Limita el peso: 8 MB para imágenes, 15 MB para vídeo.
   - Genera un nombre de archivo propio en vez de usar el nombre
     original, para evitar nombres con caracteres raros o
     maliciosos.

3. **Los borradores ya no eran del todo privados — esto ya está
   arreglado.** Se descubrió que, aunque un caso estuviera marcado
   como "no publicado", sus fotos, etiquetas y normativa técnica
   igual se podían consultar por fuera del panel (con las mismas
   credenciales públicas que usa la propia web). Se corrigió la
   configuración de la base de datos (`supabase/schema.sql`) para
   que eso ya no sea posible: un caso sin publicar ahora está
   completamente oculto, no solo "no listado".

   > ⚠️ **Si ya creaste tu proyecto en Supabase y pegaste una versión
   > anterior de `schema.sql`**, tenés que volver a entrar a
   > "SQL Editor" y ejecutar, como mínimo, la sección "Seguridad: Row
   > Level Security (RLS)" de este archivo actualizado (podés
   > ejecutar todo el archivo de nuevo sin problema si todavía no
   > tenés casos cargados). Si ya tenés casos reales, decime y te
   > paso solo las líneas que hace falta actualizar.

4. **El bucket de archivos (Storage) ahora tiene reglas explícitas.**
   Antes solo estaba descrito en un mensaje de error qué política
   había que crear a mano. Ahora es parte de `schema.sql`: cualquiera
   puede *ver* una foto ya subida (así se muestran en la web
   pública), pero solo un usuario logueado puede subir o borrar
   archivos.

5. **Cabeceras de seguridad del navegador.** Se agregaron en
   `next.config.js`. No cambian nada visualmente; le indican al
   navegador reglas adicionales de protección (por ejemplo, que
   nadie puede embeber esta web dentro de otra página con fines de
   engaño).

6. **Validaciones básicas de formulario del lado del servidor**:
   título obligatorio, categoría obligatoria, límites de longitud
   razonables, y que un link de normativa sea realmente una URL
   (`http://` o `https://`) y no algo potencialmente peligroso.

### Qué NO se hizo (a propósito, por ahora)

- **Un límite de intentos de login** (para frenar a alguien probando
  contraseñas una y otra vez) no se implementó todavía: Supabase Auth
  ya aplica un límite propio por defecto, y armar uno adicional
  requeriría un servicio externo (por ejemplo, Redis) que agregaría
  complejidad sin necesidad inmediata para un panel de un solo
  administrador. Si en algún momento vas a tener varios usuarios
  administradores, conviene retomarlo.
- **Una Content-Security-Policy (CSP) estricta** no se agregó: es una
  protección más fuerte contra ciertos ataques, pero mal configurada
  puede romper silenciosamente los vídeos de YouTube o las imágenes
  de Supabase, y no hay forma de probarla sin el proyecto corriendo
  de verdad. Queda anotado como mejora posible para la Fase 15, una
  vez que la web esté publicada y se pueda probar en vivo.
- Las páginas `/contacto`, `/sobre` y `/legal/*` todavía están
  vacías (no forman parte de las fases numeradas 1 a 15 del plan
  original); cuando quieras las armamos.

### Próximo paso

Fase 15: Deploy. Vamos a publicar el proyecto paso a paso: crear tu
cuenta de Supabase, pegar `schema.sql`, crear el bucket
`case-media`, subir el código a GitHub y conectarlo con Vercel.


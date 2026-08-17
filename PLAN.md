# Plan de implementación — Shortedd

## 1. Propósito

Construir una aplicación web estática para comprimir URLs y generar códigos QR
eficientes, sin cuentas, base de datos, API ni analítica de terceros. El destino
viaja autocontenido en el enlace; el navegador lo decodifica y redirige.

**Propuesta de valor:** enlaces privados, portables y rápidos de crear, con un
modo de alta densidad pensado específicamente para códigos QR.

**Experiencia objetivo:** una interfaz limpia, sobria y de acabado premium, que
permita generar y compartir un enlace en segundos. El rendimiento es una función
principal del producto: debe sentirse instantánea incluso en móviles modestos.

## 2. Límites del producto

El MVP no incluirá aliases personalizados, enlaces editables, caducidad,
revocación, equipos ni estadísticas de clics: todos requieren estado persistente
y, por tanto, un backend.

El producto debe comunicar esta limitación de forma clara. No debe presentarse
como un sustituto de un acortador gestionado tipo Bitly.

## 3. Arquitectura propuesta

Aplicación estática distribuida por CDN:

```text
Usuario
  └─ aplicación web estática
       ├─ normalización y saneamiento de URL
       ├─ codec versionado (codifica / decodifica)
       ├─ selector de formato óptimo
       ├─ generador QR SVG/PNG
       └─ PWA / caché offline

Enlace web: https://dominio/#v1.<payload>
Enlace QR:  https://dominio/q/<payload-alphanumeric>
```

El host debe configurar un fallback que devuelva `index.html` para `/q/*`.
Los fragmentos (`#...`) no necesitan configuración porque no se envían al servidor.

## 4. Formatos de enlace

### 4.1. Web universal

`https://dominio/#v1.<payload-base64url>`

- Conserva mayúsculas, minúsculas y símbolos URL seguros.
- Debe ser el formato predeterminado para compartir por web.
- Puede evolucionar añadiendo nuevos codecs mediante el prefijo de versión.

### 4.2. QR de alta densidad

`https://dominio/q/<payload-QR>`

- El payload sólo puede usar `0-9 A-Z $%*+-./:`.
- Debe priorizar menor versión QR y corrección de errores compatible.
- Se ofrece como alternativa, no como reemplazo del formato universal.

### 4.3. Compatibilidad

- Cada payload comienza con una versión explícita (`v1`, `v2`, etc.).
- Los decodificadores publicados no se modifican de forma incompatible.
- El lanzamiento de una versión debe conservar sus fixtures y tests para siempre.
- Un payload inválido, demasiado largo o de versión desconocida nunca redirige.

## 5. Fases

### Fase 0 — Fundaciones

1. Inicializar proyecto TypeScript con Vite y React 19.
2. Configurar shadcn/ui con Tailwind CSS y copiar al repositorio sólo los
   componentes que se utilicen. shadcn/ui será la base de interacción, no una
   dependencia visual monolítica.
3. Instalar únicamente componentes necesarios para el MVP: `Button`, `Input`,
   `Card`, `Tabs`, `Tooltip`, `Switch`, `Select`, `Dialog`, `Sheet` y `Sonner`.
4. Configurar ESLint, Prettier, pruebas unitarias y CI.
5. Crear un corpus de URLs de prueba: dominios comunes, Unicode, puertos,
   fragmentos, query strings, URLs muy largas y entradas malformadas.

**Aceptación:** `lint`, pruebas y build reproducible ejecutan localmente y en CI.

### Fase 1 — Codec v1 y redirección segura

1. Implementar `normalizeUrl(input)`:
   - exigir `http:` o `https:`;
   - eliminar espacios accidentales;
   - normalizar hostname y punycode mediante la URL nativa;
   - rechazar protocolos peligrosos (`javascript:`, `data:`, `file:`).
2. Implementar codificación y decodificación binaria reversibles.
3. Añadir diccionario inicial de protocolos, `www.`, TLD y dominios frecuentes.
4. Implementar checksum CRC32 para detectar corrupción accidental.
5. Detectar `#v1.payload` y `/q/payload` al cargar la aplicación.
6. Presentar una pantalla de previsualización con el dominio destino, botón de
   continuar y opción de cancelar. Usar `location.replace()` sólo tras validar.

**Aceptación:** cada URL válida del corpus completa el ciclo encode/decode sin
cambios semánticos; entradas inválidas muestran error sin redirección.

### Fase 2 — Compresión adaptativa

1. Crear codecs candidatos independientes:
   - literal normalizado;
   - diccionario de host/TLD;
   - tokenización de ruta;
   - compresión de parámetros frecuentes.
2. Codificar cada candidato y seleccionar el payload final más corto.
3. Mantener una tabla de métricas por corpus: tamaño original, tamaño final,
   ratio y tiempo de codificación/decodificación.
4. Añadir stripping opcional de parámetros de tracking conocidos (`utm_*`,
   `fbclid`, `gclid`) con una vista previa de los parámetros eliminados.

**Aceptación:** la aplicación nunca produce un enlace incorrecto; el selector
elige el payload más corto entre los candidatos válidos.

### Fase 3 — QR y experiencia de creación

1. Implementar conversión determinista al alfabeto QR.
2. Generar QR en SVG como formato principal y PNG como descarga opcional.
3. Permitir tamaño, margen y nivel de corrección de errores.
4. Calcular y mostrar versión QR, número de módulos y estimación de escaneabilidad.
5. Mostrar comparación clara entre enlace universal y QR.
6. Añadir acciones accesibles: copiar, compartir mediante Web Share API y descargar.
7. Diseñar la interfaz con estos principios:
   - una única acción principal: pegar o escribir una URL;
   - resultado y acciones relevantes visibles sin desplazamiento en escritorio;
   - jerarquía visual clara, tipografía legible y espaciado generoso;
   - paleta neutra con un único color de acento y modo oscuro cuidado;
   - animaciones breves y funcionales; respetar `prefers-reduced-motion`;
   - estados de carga, éxito, error y copiado inequívocos;
   - navegación por teclado, foco visible y contraste AA como mínimo.

**Aceptación:** el QR generado se puede escanear en dispositivos reales y
redirecciona al mismo destino que el enlace universal. Un usuario puede pegar
una URL, copiar el resultado o descargar su QR sin tutorial ni registro.

### Fase 4 — PWA, seguridad y publicación

1. Añadir manifest, iconos y service worker para que la interfaz funcione offline.
2. Establecer Content Security Policy estricta y evitar scripts de terceros.
3. Limitar tamaño de entrada/payload y evitar bucles de redirección.
4. Añadir aviso ante hostnames Unicode confusos y dominios con apariencia engañosa.
5. Crear páginas de error para URL corrupta, formato desconocido y payload excesivo.
6. Desplegar en Cloudflare Pages, Netlify, GitHub Pages o Vercel; verificar el
   fallback de `/q/*`, HTTPS y cabeceras de seguridad.

**Aceptación:** la aplicación instalada funciona offline para generar enlaces;
los enlaces existentes se resuelven correctamente desde un navegador limpio.

## 6. Estructura inicial

```text
src/
  app/                 # UI React, rutas y flujos de usuario
    components/         # componentes propios de producto
    hooks/              # hooks de estado y accesibilidad
    lib/                # utilidades de interfaz
  components/ui/        # componentes shadcn/ui instalados selectivamente
  codec/
    v1/                # formato inmutable
    registry.ts         # selección por versión
    checksum.ts
    dictionary.ts
  qr/                  # alfabeto QR y generación de imágenes
  security/             # validación y detección de confusables
  pwa/
tests/
  fixtures/urls.json
  codec/
  e2e/
public/
  manifest.webmanifest
```

## 7. Calidad y pruebas

- Unitarias: normalización, codec, checksum, selección adaptativa y QR.
- Property-based: `decode(encode(url))` conserva la URL normalizada.
- Fixtures de compatibilidad: payloads conocidos de cada versión.
- E2E: creación, copia, apertura del enlace y redirección.
- Visuales: interfaz responsive y QR SVG/PNG.
- Rendimiento: codificación y decodificación en menos de 100 ms para URLs normales.
- Rendimiento de interfaz: presupuesto inicial de JavaScript inferior a 150 KB
  comprimido, sin fuentes ni trackers de terceros y carga diferida del generador
  QR hasta que el usuario lo necesite. Este margen contempla React 19 y los
  componentes shadcn/ui estrictamente necesarios.
- Auditoría: objetivo Lighthouse de 95 o más en rendimiento, accesibilidad,
  buenas prácticas y SEO para la página principal en una compilación de producción.
- Interacción: la entrada responde en menos de 50 ms; las operaciones costosas
  se ejecutan con debounce corto o en un Web Worker si el corpus lo justifica.

## 7.1. Dirección visual y de rendimiento

La página inicial tendrá una composición deliberadamente mínima:

```text
Cabecera discreta: marca + selector de tema

Titular breve y explicación de privacidad
Campo URL amplio + acción de generar

Resultado: enlace copiable, ahorro y selector Web / QR
Acciones secundarias: compartir, descargar SVG/PNG, opciones

Pie mínimo: código abierto, privacidad y ayuda
```

Decisiones de implementación:

- Usar React 19 para la composición de la interfaz y shadcn/ui como biblioteca
  de componentes accesibles y personalizables. La estética final será propia:
  los componentes se ajustarán mediante tokens de Tailwind, no con el aspecto
  predeterminado de shadcn/ui.
- Preferir componentes shadcn/ui locales y selectivos. No instalar un kit UI
  completo ni importar componentes que no se muestren en el producto.
- Usar SVG e iconos inline propios o un conjunto muy pequeño; no cargar librerías
  visuales completas para unos pocos iconos.
- Usar fuentes de sistema por defecto o alojar una única fuente variable
  autoalojada con `font-display: swap`.
- Reservar espacio para el QR y otros elementos dinámicos para evitar saltos de
  diseño (CLS).
- Mantener el estado únicamente en memoria o en `localStorage` para preferencias
  no sensibles, como tema, opciones de QR y eliminación de tracking.

## 8. Decisiones pendientes antes de iniciar

1. Dominio de producción y longitud máxima aceptable.
2. Política de eliminación de parámetros: activada por defecto o confirmada por el usuario.
3. Si la previsualización debe ser obligatoria o configurable.
4. Biblioteca QR concreta, tras comprobar tamaño del bundle, licencia y generación SVG.
5. Lista inicial de dominios/tokens a optimizar, basada en un corpus público y reproducible.

## 9. Entregable del MVP

Una web desplegada y de código abierto que acepta una URL HTTP(S), genera un
enlace universal y una variante QR, permite copiar/descargar y resuelve ambos
formatos de forma local, validada y compatible con futuras versiones.

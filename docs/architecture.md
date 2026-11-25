# Arquitectura de ARGENTISTA

## Visión general

El proyecto es **server-first**: Astro renderiza cada página en el servidor (SSR con
adapter de Vercel) y consulta las APIs públicas antes de enviar el HTML. React se usa
solo para las partes interactivas, como islas hidratadas con los datos ya resueltos.

```
┌──────────────────────────────┐
│  Navegador                   │
│  HTML + islas React          │
└──────────────┬───────────────┘
               │ fetch / navegación
┌──────────────▼───────────────┐
│  Astro SSR (Vercel Function) │
│  frontmatter → lib/api.ts    │
└──────────────┬───────────────┘
               │ caché en memoria (TTL)
┌──────────────▼───────────────┐
│  ArgentinaDatos · DolarAPI   │
└──────────────────────────────┘
```

## Flujo de datos

1. La página (`src/pages/*.astro`) llama a `getInflation`, `getDollarRates` o
   `getDollarSeriesWindow` en el frontmatter.
2. `src/lib/api.ts` responde desde su caché si el TTL sigue vigente y, si no, consulta la
   API externa con timeout. Ante un fallo devuelve el último valor cacheado o una lista
   vacía: la página nunca se cae por un upstream caído.
3. El HTML viaja con los datos embebidos como props de las islas, así que no hay
   spinners en el primer render.
4. Si el usuario cambia el rango del histórico, `DollarHistoryChart` pide
   `/api/dolar-series.json?desde=…`; ese endpoint reutiliza la misma caché y recorta la
   serie antes de responder.
5. Las cabeceras `Cache-Control` se envían solo cuando hay datos, para no cachear errores.

## Capas

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/api.ts` | Fetch a ArgentinaDatos y DolarAPI, tipos, caché con TTL y timeouts |
| `src/lib/finance.ts` | Inflación acumulada/anualizada, parseo y formato es-AR |
| `src/lib/chartTheme.ts` | Opciones compartidas de Chart.js (ejes, leyenda, tooltip) |
| `src/pages/api/*` | Endpoints que sirven datos derivados ya cacheados |
| `src/components/*` | Islas React y componentes Astro de presentación |
| `src/styles/global.css` | Tailwind, tokens de diseño y clases base (`.card`, `.field-label`) |

## Decisiones

- **SSR en vez de fetch en el cliente:** elimina la cascada de requests, mejora el LCP y
  evita depender de CORS.
- **Caché en memoria con TTL:** 5 minutos para el dólar y 1 hora para la inflación, que
  cambian a ese ritmo. El CDN suma 5–10 minutos con `stale-while-revalidate`.
- **Un endpoint para el histórico:** la API externa no filtra por fecha y devuelve ~2,9 MB
  por consulta; el endpoint recorta en el servidor y reduce la respuesta a kilobytes.
- **Cálculos puros en `lib/finance.ts`:** se testean sin DOM ni red.
- **Service worker mínimo:** solo cachea iconos e imágenes; nunca HTML, para que un
  deploy nuevo se vea al instante.
- **Headers de seguridad:** `src/middleware.ts` aplica CSP, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`
  a todas las respuestas del servidor, incluidas las rutas de API.

## Extensibilidad

- Nuevos indicadores: sumar un fetcher en `lib/api.ts` y una tarjeta en `SummaryCards`.
- Nuevos gráficos: reutilizar `chartTheme.ts` para mantener el estilo.
- Caché compartida: si el volumen crece, reemplazar el `Map` por Redis o el cache de
  Vercel sin tocar las páginas.

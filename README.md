# ARGENTISTA

> Visualizador de inflación y cotizaciones del dólar en Argentina con datos públicos en tiempo real.

![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

## Características

- **Resumen económico:** inflación mensual e interanual, dólar oficial y blue con la brecha contra el oficial, riesgo país y UVA.
- **Calculadora de inflación:** ajusta un monto entre dos meses con el índice mensual y muestra inflación total, mensual promedio y anualizada.
- **Conversor de moneda:** convierte entre pesos y dólares con las cotizaciones vigentes, en ambos sentidos y con la tasa correcta según la dirección.
- **Cotizaciones del dólar:** lista compra y venta de las casas disponibles en `dolarapi.com`.
- **Histórico por casa:** gráfico de líneas con oficial, blue, bolsa, contado con liquidación, mayorista, cripto y tarjeta; permite cambiar el rango temporal.
- **Inflación mensual:** gráfico interactivo con filtro por fechas, abierto en los últimos diez años.
- **Detalle histórico:** agrupación por década y año con mínimos, máximos y promedios mensuales.
- **Datos en el servidor:** las páginas consultan las APIs durante el render, con caché en memoria y en el CDN; las islas reciben los datos ya resueltos.
- **Navegación por secciones:** inicio con resumen, calculadora y conversor; `/dolar` y `/inflacion`.
- **PWA:** manifiesto, iconos y service worker que cachea solo los assets estáticos.
- **SEO:** sitemap, `robots.txt`, canonical, Open Graph y datos estructurados.
- **Responsive:** layout adaptable con Tailwind CSS.

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Astro 5 con SSR y adapter de Vercel |
| UI | React 19 como islas (`client:load`) |
| Estilos | Tailwind CSS 4 |
| Gráficos | Chart.js con `react-chartjs-2` |
| Datos | ArgentinaDatos y DolarAPI |
| Tests | Vitest con jsdom y Testing Library |
| Deploy | Vercel con Analytics y Speed Insights |

## Estructura del proyecto

```text
src/
  pages/         index, dolar, inflacion, 404, 500, sitemap y endpoint de series
  components/    calculadoras, conversor, gráficos y resumen en React/Astro
  lib/           acceso a APIs con caché, cálculos y tema de gráficos
  layouts/       Layout.astro
  styles/        CSS global con Tailwind
  test/          setup de Vitest
  basic.test.ts  test base
public/          iconos, manifiesto, service worker, robots y Open Graph
docs/            notas de arquitectura
```

## Puesta en marcha

### Requisitos

- Node.js 20 o superior y npm.
- Conexión a internet: las páginas consultan las APIs públicas durante el render.

### Instalación

```bash
npm install
npm run dev
```

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run start` | Alias de `dev` |
| `npm run build` | `astro check` y build de producción |
| `npm run preview` | Sirve el build generado |
| `npm run astro` | Acceso directo al CLI de Astro |
| `npm run test` | Ejecuta Vitest |

## Despliegue

El proyecto usa el adapter de Vercel y las integraciones de Analytics y Speed Insights,
así que se despliega directamente en Vercel. No requiere variables de entorno: las
consultas a las APIs públicas se hacen en el servidor, con caché en memoria y cabeceras
`Cache-Control` para el CDN.

## Estado del proyecto

Aplicación funcional con las tres vistas operativas, páginas de error, sitemap y PWA
instalable. La lógica de cálculo, el parseo de montos y las islas de React están cubiertos
por tests.

## Licencia

Sin licencia definida.

## Autor

Marcos Zingaretti — https://github.com/marcoszinga94

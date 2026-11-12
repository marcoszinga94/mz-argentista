# ARGENTISTA

> Visualizador de inflación y cotizaciones del dólar en Argentina con datos públicos en tiempo real.

![Astro](https://img.shields.io/badge/Astro-FF5D01?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

## Características

- **Calculadora de inflación:** ajusta un monto entre dos meses con el índice mensual y muestra inflación total, mensual promedio y anualizada.
- **Conversor de moneda:** convierte entre pesos y dólares con las cotizaciones vigentes, en ambos sentidos.
- **Cotizaciones del dólar:** lista los precios de venta de las casas disponibles en `dolarapi.com`.
- **Histórico por casa:** gráfico de líneas con oficial, blue, bolsa, contado con liquidación, mayorista, cripto y tarjeta; permite comparar series y cambiar el rango temporal.
- **Inflación mensual:** gráfico interactivo con filtro por fechas.
- **Detalle histórico:** agrupación por década y año con mínimos, máximos y promedios mensuales.
- **Navegación por secciones:** inicio con calculadora y conversor, `/dolar` y `/inflacion`.
- **PWA:** `manifest.json` con iconos y modo standalone para instalar la app.
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
  pages/         index, dolar e inflacion
  components/    calculadoras, conversor y gráficos en React
  layouts/       Layout.astro
  styles/        CSS global con Tailwind
  test/          setup de Vitest
  basic.test.ts  test base
public/          iconos de la app
docs/            notas de arquitectura
manifest.json    manifiesto PWA
```

## Puesta en marcha

### Requisitos

- Node.js 20 o superior y npm.
- Conexión a internet: los datos se consultan desde el navegador.

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
así que se despliega directamente en Vercel. No requiere variables de entorno ni backend
propio: las consultas salen del cliente hacia las APIs públicas.

## Estado del proyecto

Aplicación funcional con las tres vistas operativas. La cobertura de tests es mínima: hoy
solo existe un test base de Vitest.

## Licencia

Sin licencia definida.

## Autor

Marcos Zingaretti — https://github.com/marcoszinga94

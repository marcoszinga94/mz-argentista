# AGENTS.md - Guía para agentes de desarrollo

## Proyecto

**ARGENTISTA** - Aplicación web de datos económicos en tiempo real sobre Argentina (inflación, dólar, etc.).

## Stack tecnológico

- **Framework**: Astro 5.16 (SSR con Vercel adapter)
- **UI**: React 19 + Tailwind CSS 4
- **Testing**: Vitest + @testing-library
- **TypeScript**: Configuración base de Astro

## Comandos disponibles

| Comando           | Descripción                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Iniciar servidor de desarrollo    |
| `npm run build`   | Build + typecheck (`astro check`) |
| `npm run preview` | Preview del build                 |
| `npm run test`    | Ejecutar tests con Vitest         |

## Estructura del proyecto

```
src/
├── components/      # Componentes (React .jsx y Astro .astro)
├── layouts/         # Layouts Astro
├── pages/           # Páginas Astro (rutas)
├── styles/          # CSS global
├── test/            # Setup de Vitest
└── Icons/           # Iconos SVG
docs/
└── architecture.md  # Documentación de arquitectura
```

## Convenciones de código

- **Componentes React**: Extensión `.jsx`, usan hooks (`useState`, `useEffect`), fetch a API `api.argentinadatos.com`
- **Componentes Astro**: Extensión `.astro`, importan componentes React con `client:load`
- **Estilos**: Tailwind CSS con clases utilitarias (no CSS personalizado)
- **Naming**: PascalCase para componentes, camelCase para funciones
- **Tests**: Archivos `.test.ts`, расположены junto al código que prueban o en `src/test/` para setup

## API externa

- **ArgentinaDatos**: `https://api.argentinadatos.com/v1/finanzas/indices/inflacion`

## Reglas importantes

1. **NO** agregar comentarios al código (salvo que el usuario lo pida explícitamente)
2. **NUNCA** exponer claves API o secretos en el código
3. Ejecutar `npm run build` antes de commits para verificar typecheck
4. Los tests usan jsdom y @testing-library/jest-dom

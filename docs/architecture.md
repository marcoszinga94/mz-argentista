# Arquitectura de ARGENTISTA

## Visión general

ARGENTISTA está construida sobre una arquitectura **full‑stack** ligera:

```
┌──────────────────────────┴──┐
│  Navegador (Cliente)     │
├─────────────────┬─────────┴─┤
│ Astro + React │ Tailwind |
├─────────────────┴───────┴───┤
│     Lógica de UI         │
├─────────────┬─────────────┴─┤
│  API ArgentinaDatos      │
|Proxy Node.js (opcional)  |
└─────────────────────────────┘
```

- **Astro** actúa como _renderer_ estático que genera los HTML y sirve la SPA React.
- Los componentes de **React** manejan la interacción, el estado local y las llamadas a la API.
- **Tailwind CSS** proporciona estilos utilitarios y responsividad sin escribir CSS manualmente.
- El _proxy Node.js_ (si se habilita) añade caché, autenticación o transformación de datos antes de llegar al cliente.

## Flujo de datos

1.  La página carga los componentes React.
2.  Cada componente realiza una llamada a la API de **ArgentinaDatos** (o al proxy).
3.  Los datos se almacenan en el _state_ y se renderizan en gráficos interactivos.
4.  Cuando un usuario activa una alerta, se almacena localmente o en el backend para notificaciones push.

## Tecnologías clave

| Tecnología         | Rol                                        |
| ------------------ | ------------------------------------------ |
| Astro              | Generación de HTML estático + SSR opcional |
| React              | UI reactiva y gestión de estado            |
| Tailwind CSS       | Estilos utilitarios                        |
| Node.js (opcional) | Proxy, caché y lógica del backend          |
| TypeScript         | Tipado fuerte en todo el stack             |
| Vitest             | Pruebas unitarias e integración            |

## Extensibilidad

- **Plugins Astro**: Añade funcionalidades como PWA, sitemap o generación de RSS.
- **Componentes React reutilizables**: Se pueden compartir entre proyectos con `npm publish`.
- **Caché en Edge Functions**: Reduce latencia y consumo de API.

---

> 📌 _Próximo paso:_ Revisar la capa de **backend** (si existe) para optimizar las llamadas a la API y habilitar caché en memoria o Redis.

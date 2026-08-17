# Shortedd

Acortador de URLs y generador de códigos QR sin backend, base de datos ni
analítica de terceros. El destino viaja autocontenido en el propio enlace; el
navegador lo decodifica localmente y redirige. Ver [`PLAN.md`](./PLAN.md) para
el spec de producto/arquitectura completo.

## Desarrollo

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción (`tsc -b && vite build`).
- `npm run preview` — sirve el build de producción localmente.
- `npm run lint` — ESLint.
- `npm run format` / `npm run format:check` — Prettier.
- `npm run test` / `npm run test:watch` — pruebas unitarias (Vitest).
- `npm run test:e2e` — pruebas E2E (Playwright).

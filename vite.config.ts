/// <reference types="vitest/config" />
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Shortedd',
        short_name: 'Shortedd',
        description:
          'Acortador de URLs y generador de QR sin backend: el destino viaja dentro del propio enlace.',
        theme_color: '#5b21b6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        lang: 'es',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell únicamente: decodificar/redirigir sigue siendo 100%
        // cliente, así que tanto "/" como "/q/<payload>" deben resolver al
        // mismo index.html cacheado (igual que el fallback 404.html de
        // GitHub Pages, pero para el caso controlado por el service worker).
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
})

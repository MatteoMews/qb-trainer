import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/qb-trainer/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'QB Trainer',
        short_name: 'QB Trainer',
        description: 'American-Football-Taktik-App für Quarterbacks: Spielzüge, Defenses, Simulation, Reads, Quiz und Scouting – komplett offline im Browser.',
        lang: 'de',
        start_url: '/qb-trainer/',
        scope: '/qb-trainer/',
        display: 'standalone',
        background_color: '#242424',
        theme_color: '#0e5c2f',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Alles läuft im Browser ohne Server/API (Projektauftrag 1) - precache des gesamten
        // App-Shells reicht für vollständige Offline-Nutzung, kein Runtime-Caching nötig.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})

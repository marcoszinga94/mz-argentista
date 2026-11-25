// @ts-check

import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://argentista.vercel.app",
  output: "server",
  integrations: [react()],
  adapter: vercel(),
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
  prefetch: true,
});
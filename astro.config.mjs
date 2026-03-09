// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config

export default defineConfig({
  output: "static",

  site: "https://pisichi.github.io/personal-utility", // Replace with your GitHub username

  base: "/personal-utility",

  integrations: [svelte(), tailwind()],

  vite: {
    plugins: [],
  },
});

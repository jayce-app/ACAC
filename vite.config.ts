import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages uses /ACAC/; Render and local root deploys use /
const base = process.env.VITE_BASE_PATH ?? (process.env.RENDER ? "/" : "/ACAC/");

export default defineConfig({
  plugins: [react()],
  base,
});

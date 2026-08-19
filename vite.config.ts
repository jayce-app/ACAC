import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Repo site: https://jayce-app.github.io/ACAC/
  base: "/ACAC/",
});

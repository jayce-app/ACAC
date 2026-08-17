import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { projectPhotoBucketPlugin } from "./vite-plugin-project-bucket.ts";

export default defineConfig({
  plugins: [react(), projectPhotoBucketPlugin()],
});

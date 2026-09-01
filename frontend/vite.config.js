import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React/router — changes rarely, so browsers cache it
          // across deploys instead of re-downloading it every release.
          vendor: ["react", "react-dom", "react-router-dom"],
          // Only needed on Cart/Order pages, not the initial page load.
          pdf: ["jspdf", "jspdf-autotable"],
        },
      },
    },
  },
});

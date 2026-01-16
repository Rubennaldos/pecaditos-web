import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // Usar ruta absoluta "/" para Vercel
  base: "/",
  server: { host: "::", port: 8080 },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: true },
  plugins: [react(), mode === "development" ? componentTagger() : null].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
}));

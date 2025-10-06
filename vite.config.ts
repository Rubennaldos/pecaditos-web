import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // En Pages usamos VITE_BASE; si no existe, tu lógica normal:
  base: process.env.VITE_BASE ?? (mode === "production" ? "./" : "/"),
  server: { host: "::", port: 8080 },
  build: { outDir: "dist", emptyOutDir: true, sourcemap: true },
  plugins: [react(), mode === "development" ? componentTagger() : null].filter(Boolean),
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
}));

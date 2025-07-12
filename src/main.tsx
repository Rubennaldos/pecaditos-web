
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configurar modo oscuro por defecto basado en preferencia del sistema
if (!localStorage.getItem('theme')) {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
} else if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);

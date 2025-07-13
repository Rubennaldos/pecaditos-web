
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Solo modo claro elegante - sin modo oscuro
createRoot(document.getElementById("root")!).render(<App />);

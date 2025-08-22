import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/setAdmin' // Carregar utilitário de admin

createRoot(document.getElementById("root")!).render(<App />);

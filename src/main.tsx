
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './i18n'; // Import i18n configuration before App
import { Toaster } from '@/components/ui/toaster';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toaster />
  </BrowserRouter>
);

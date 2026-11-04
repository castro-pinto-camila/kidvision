import './style.css';
import { iniciarApp } from './ui/app';

void iniciarApp(document.querySelector<HTMLDivElement>('#app')!);

// Sin internet: el service worker guarda la app la primera vez que se abre.
// Solo en la versión compilada (en desarrollo molestaría al recargar los cambios).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js'));
}

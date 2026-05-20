import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { OfflineService } from "./services/OfflineService";

// Register service worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    OfflineService.registerServiceWorker().then((registered) => {
      if (registered) {
        console.log('✅ PWA: Service Worker registered - Offline mode enabled');
      } else {
        console.warn('⚠️ PWA: Service Worker not supported');
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
